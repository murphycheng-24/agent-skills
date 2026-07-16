#!/usr/bin/env python3
"""
代码审查 Skill - 提交区间分析脚本
用法：python analyze_commits.py <start_commit> <end_commit> [--repo <repo_path>]

输出：结构化 JSON，包含提交列表、文件变更统计、diff 摘要
"""

import subprocess
import json
import sys
import os
import argparse
from datetime import datetime


def run_git(args: list[str], cwd: str) -> str:
    """执行 git 命令并返回输出"""
    result = subprocess.run(
        ["git"] + args,
        cwd=cwd,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if result.returncode != 0:
        print(f"[WARN] git {' '.join(args)} 返回非零退出码: {result.returncode}", file=sys.stderr)
        print(result.stderr, file=sys.stderr)
    return result.stdout.strip()


def get_commits(start: str, end: str, cwd: str) -> list[dict]:
    """获取提交区间内的所有提交"""
    raw = run_git(
        ["log", f"{start}^..{end}", "--pretty=format:%H|%an|%ae|%ai|%s", "--reverse"],
        cwd,
    )
    commits = []
    for line in raw.splitlines():
        if "|" not in line:
            continue
        parts = line.split("|", 4)
        if len(parts) < 5:
            continue
        commits.append({
            "hash": parts[0],
            "hash_short": parts[0][:8],
            "author": parts[1],
            "email": parts[2],
            "date": parts[3],
            "message": parts[4],
        })
    return commits


def get_diff_stat(start: str, end: str, cwd: str) -> dict:
    """获取整体 diff 统计"""
    raw = run_git(["diff", "--stat", f"{start}^", end], cwd)
    lines = raw.splitlines()
    files = []
    summary = ""
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if "changed" in line and ("insertion" in line or "deletion" in line):
            summary = line
        elif "|" in line:
            parts = line.split("|")
            fname = parts[0].strip()
            change = parts[1].strip() if len(parts) > 1 else ""
            files.append({"file": fname, "change": change})
    return {"files": files, "summary": summary}


def get_diff_full(start: str, end: str, cwd: str, max_lines: int = 2000) -> str:
    """获取完整 diff（限制行数防止过大）"""
    raw = run_git(["diff", f"{start}^", end, "--unified=3"], cwd)
    lines = raw.splitlines()
    if len(lines) > max_lines:
        truncated = lines[:max_lines]
        truncated.append(f"\n... [已截断，共 {len(lines)} 行，只展示前 {max_lines} 行] ...")
        return "\n".join(truncated)
    return raw


def get_changed_files(start: str, end: str, cwd: str) -> list[str]:
    """获取变更文件列表"""
    raw = run_git(["diff", "--name-only", f"{start}^", end], cwd)
    return [f for f in raw.splitlines() if f.strip()]


def classify_files(files: list[str]) -> dict:
    """按文件类型/模块分类"""
    categories = {
        "components": [],
        "hooks": [],
        "store": [],
        "utils": [],
        "types": [],
        "tests": [],
        "config": [],
        "styles": [],
        "other": [],
    }
    for f in files:
        low = f.lower()
        if any(x in low for x in [".spec.", ".test.", "__tests__"]):
            categories["tests"].append(f)
        elif "/hooks/" in low or "use" in os.path.basename(low).lower():
            categories["hooks"].append(f)
        elif "/store/" in low or "store" in os.path.basename(low).lower():
            categories["store"].append(f)
        elif "/components/" in low or ".vue" in low:
            categories["components"].append(f)
        elif "type" in os.path.basename(low).lower() or low.endswith(".d.ts"):
            categories["types"].append(f)
        elif any(low.endswith(ext) for ext in [".css", ".scss", ".less", ".sass"]):
            categories["styles"].append(f)
        elif any(x in low for x in ["config", "vite", "tsconfig", ".json", ".yaml", ".yml"]):
            categories["config"].append(f)
        elif "/utils/" in low or "/helpers/" in low:
            categories["utils"].append(f)
        else:
            categories["other"].append(f)
    return {k: v for k, v in categories.items() if v}


def detect_risk_patterns(diff_text: str) -> list[dict]:
    """基于 diff 文本检测常见风险模式"""
    risks = []
    lines = diff_text.splitlines()

    patterns = [
        {
            "pattern": "addEventListener",
            "counter": "removeEventListener",
            "desc": "检测到 addEventListener，请确认是否有对应的 removeEventListener 清理",
            "level": "P1",
        },
        {
            "pattern": "setInterval",
            "counter": "clearInterval",
            "desc": "检测到 setInterval，请确认是否有对应的 clearInterval 清理",
            "level": "P1",
        },
        {
            "pattern": "setTimeout",
            "counter": None,
            "desc": "检测到 setTimeout，注意组件卸载前未清理可能导致内存泄漏",
            "level": "P2",
        },
        {
            "pattern": "new Worker(",
            "counter": "worker.terminate",
            "desc": "检测到 Web Worker 创建，请确认有 terminate() 清理",
            "level": "P1",
        },
        {
            "pattern": "getContext(",
            "counter": None,
            "desc": "检测到 Canvas/WebGL context 获取，注意 context 数量限制（浏览器通常限制 16 个）",
            "level": "P1",
        },
        {
            "pattern": "async",
            "counter": None,
            "desc": "存在异步操作，注意竞态条件（Race Condition）",
            "level": "P2",
        },
        {
            "pattern": "any",
            "counter": None,
            "desc": "使用了 TypeScript any 类型，可能绕过类型检查",
            "level": "P2",
        },
        {
            "pattern": "console.log",
            "counter": None,
            "desc": "生产代码中存在 console.log 调试输出",
            "level": "P2",
        },
        {
            "pattern": "TODO",
            "counter": None,
            "desc": "存在未完成的 TODO 注释",
            "level": "P2",
        },
        {
            "pattern": "FIXME",
            "counter": None,
            "desc": "存在 FIXME 标记，需关注",
            "level": "P1",
        },
    ]

    added_lines = [l[1:] for l in lines if l.startswith("+") and not l.startswith("+++")]
    added_text = "\n".join(added_lines)

    for p in patterns:
        if p["pattern"] in added_text:
            has_counter = p["counter"] and p["counter"] in added_text
            if not has_counter:
                risks.append({
                    "pattern": p["pattern"],
                    "level": p["level"],
                    "description": p["desc"],
                    "auto_detected": True,
                })

    return risks


def main():
    parser = argparse.ArgumentParser(description="Git 提交区间代码审查分析工具")
    parser.add_argument("start", help="起始 commit hash")
    parser.add_argument("end", help="结束 commit hash")
    parser.add_argument("--repo", default=".", help="Git 仓库路径（默认：当前目录）")
    parser.add_argument("--output", default=None, help="输出 JSON 文件路径（默认：打印到 stdout）")
    parser.add_argument("--max-diff-lines", type=int, default=2000, help="最大 diff 行数（默认：2000）")
    args = parser.parse_args()

    repo_path = os.path.abspath(args.repo)
    print(f"[INFO] 分析仓库：{repo_path}", file=sys.stderr)
    print(f"[INFO] 提交区间：{args.start[:8]} → {args.end[:8]}", file=sys.stderr)

    # 修复中文路径显示
    run_git(["config", "core.quotepath", "false"], repo_path)

    result = {
        "meta": {
            "repo": repo_path,
            "start_commit": args.start,
            "end_commit": args.end,
            "generated_at": datetime.now().isoformat(),
        },
        "commits": get_commits(args.start, args.end, repo_path),
        "diff_stat": get_diff_stat(args.start, args.end, repo_path),
        "changed_files": get_changed_files(args.start, args.end, repo_path),
        "file_categories": {},
        "auto_risks": [],
        "diff_preview": "",
    }

    result["file_categories"] = classify_files(result["changed_files"])

    diff_full = get_diff_full(args.start, args.end, repo_path, args.max_diff_lines)
    result["auto_risks"] = detect_risk_patterns(diff_full)
    result["diff_preview"] = diff_full

    print(f"[INFO] 共发现 {len(result['commits'])} 次提交，{len(result['changed_files'])} 个文件变更", file=sys.stderr)
    print(f"[INFO] 自动检测到 {len(result['auto_risks'])} 个潜在风险", file=sys.stderr)

    output_json = json.dumps(result, ensure_ascii=False, indent=2)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(output_json)
        print(f"[INFO] 结果已写入：{args.output}", file=sys.stderr)
    else:
        print(output_json)


if __name__ == "__main__":
    main()
