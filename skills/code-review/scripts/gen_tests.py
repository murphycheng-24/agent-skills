#!/usr/bin/env python3
"""
代码审查 Skill - 自动化测试脚本生成器
用法：python gen_tests.py <target_file> [--framework vitest|jest|playwright] [--output <dir>]

根据目标源文件，生成对应的测试文件模板（供 AI 填充具体测试用例）
"""

import argparse
import os
import re
import sys


VUE_COMPONENT_TEMPLATE = """\
import {{ describe, it, expect, vi, beforeEach, afterEach }} from 'vitest'
import {{ mount, flushPromises }} from '@vue/test-utils'
import {component_name} from '{import_path}'

describe('{component_name}', () => {{
  let wrapper: any

  beforeEach(() => {{
    // TODO: 初始化 store、mock 依赖
    wrapper = mount({component_name}, {{
      props: {{
        // TODO: 填写必填 props
      }},
      global: {{
        plugins: [], // TODO: 添加 pinia / router 等插件
      }},
    }})
  }})

  afterEach(() => {{
    wrapper?.unmount()
    vi.restoreAllMocks()
  }})

  it('should render correctly', () => {{
    expect(wrapper.exists()).toBe(true)
  }})

  // TODO: 根据 P0/P1 风险点补充以下测试
  // it('should cleanup event listeners on unmount', async () => {{ ... }})
  // it('should handle concurrent calls safely', async () => {{ ... }})
  // it('should not leak WebGL context', async () => {{ ... }})
}})
"""

TS_HOOK_TEMPLATE = """\
import {{ describe, it, expect, vi, beforeEach, afterEach }} from 'vitest'
import {{ {exports} }} from '{import_path}'

describe('{module_name}', () => {{
  beforeEach(() => {{
    vi.useFakeTimers()
  }})

  afterEach(() => {{
    vi.useRealTimers()
    vi.restoreAllMocks()
  }})

  describe('{primary_export}', () => {{
    it('should initialize correctly', () => {{
      // TODO: 测试初始化逻辑
    }})

    it('should cleanup on destroy', async () => {{
      // TODO: 验证清理逻辑（removeEventListener、clearInterval 等）
    }})

    it('should handle edge cases', async () => {{
      // TODO: 边界条件测试
    }})

    // TODO: 针对 P0/P1 风险点补充并发安全性测试
    it('should be safe against concurrent calls', async () => {{
      // TODO: 模拟并发调用，验证不会产生竞态
    }})
  }})
}})
"""

PLAYWRIGHT_TEMPLATE = """\
import {{ test, expect }} from '@playwright/test'

test.describe('{feature_name} E2E Tests', () => {{
  test.beforeEach(async ({{ page }}) => {{
    // TODO: 导航到目标页面
    await page.goto('http://localhost:3000/canvas')
  }})

  test('should complete main flow successfully', async ({{ page }}) => {{
    // TODO: 实现主流程验证
  }})

  test('should handle error states gracefully', async ({{ page }}) => {{
    // TODO: 模拟错误条件
  }})

  // P0 风险点 E2E 验证
  test('should not have memory leaks after repeated operations', async ({{ page }}) => {{
    // TODO: 重复执行操作，验证不崩溃
  }})
}})
"""


def detect_framework(repo_path: str) -> str:
    """从 package.json 检测测试框架"""
    pkg_path = os.path.join(repo_path, "package.json")
    if not os.path.exists(pkg_path):
        return "vitest"
    import json
    with open(pkg_path, encoding="utf-8") as f:
        pkg = json.load(f)
    deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
    if "vitest" in deps:
        return "vitest"
    if "jest" in deps or "@jest/core" in deps:
        return "jest"
    if "@playwright/test" in deps or "playwright" in deps:
        return "playwright"
    return "vitest"


def extract_exports(file_path: str) -> list[str]:
    """从源文件中提取导出的函数/常量名"""
    if not os.path.exists(file_path):
        return ["unknownExport"]
    with open(file_path, encoding="utf-8", errors="replace") as f:
        content = f.read()
    # 匹配 export function/const/class
    exports = re.findall(r"export\s+(?:default\s+)?(?:function|const|class|async function)\s+(\w+)", content)
    # 匹配 export { xxx }
    brace_exports = re.findall(r"export\s*\{([^}]+)\}", content)
    for group in brace_exports:
        exports += [e.strip().split(" as ")[0] for e in group.split(",")]
    return list(dict.fromkeys(exports)) if exports else ["unknownExport"]


def get_import_path(target_file: str, output_dir: str) -> str:
    """计算相对导入路径"""
    rel = os.path.relpath(target_file, output_dir)
    rel = rel.replace("\\", "/")
    if not rel.startswith("."):
        rel = "./" + rel
    # 去掉扩展名
    rel = re.sub(r"\.(ts|tsx|vue|js|jsx)$", "", rel)
    return rel


def generate_test_file(target_file: str, framework: str, output_dir: str) -> tuple[str, str]:
    """生成测试文件内容和路径"""
    basename = os.path.basename(target_file)
    name_no_ext = re.sub(r"\.(ts|tsx|vue|js|jsx)$", "", basename)
    ext = ".ts"

    exports = extract_exports(target_file)
    primary_export = exports[0] if exports else name_no_ext
    import_path = get_import_path(target_file, output_dir)

    is_vue = target_file.endswith(".vue")
    is_hook = "use" in name_no_ext.lower() or "/hooks/" in target_file.replace("\\", "/")

    if framework == "playwright":
        content = PLAYWRIGHT_TEMPLATE.format(feature_name=name_no_ext)
        test_filename = f"{name_no_ext}.e2e{ext}"
    elif is_vue:
        content = VUE_COMPONENT_TEMPLATE.format(
            component_name=name_no_ext,
            import_path=import_path,
        )
        test_filename = f"{name_no_ext}.spec{ext}"
    elif is_hook:
        content = TS_HOOK_TEMPLATE.format(
            module_name=name_no_ext,
            exports=", ".join(exports[:3]),
            import_path=import_path,
            primary_export=primary_export,
        )
        test_filename = f"{name_no_ext}.spec{ext}"
    else:
        content = TS_HOOK_TEMPLATE.format(
            module_name=name_no_ext,
            exports=", ".join(exports[:3]),
            import_path=import_path,
            primary_export=primary_export,
        )
        test_filename = f"{name_no_ext}.spec{ext}"

    output_path = os.path.join(output_dir, test_filename)
    return content, output_path


def main():
    parser = argparse.ArgumentParser(description="自动化测试文件生成器")
    parser.add_argument("targets", nargs="+", help="要生成测试的源文件路径（可多个）")
    parser.add_argument("--framework", default=None, choices=["vitest", "jest", "playwright"],
                        help="测试框架（默认自动检测）")
    parser.add_argument("--output", default=None, help="测试文件输出目录（默认：与源文件同目录）")
    parser.add_argument("--repo", default=".", help="仓库根目录（用于检测框架）")
    args = parser.parse_args()

    framework = args.framework or detect_framework(os.path.abspath(args.repo))
    print(f"[INFO] 使用测试框架：{framework}", file=sys.stderr)

    generated = []
    for target in args.targets:
        target_abs = os.path.abspath(target)
        if not os.path.exists(target_abs):
            print(f"[WARN] 文件不存在，跳过：{target_abs}", file=sys.stderr)
            continue

        output_dir = args.output if args.output else os.path.dirname(target_abs)
        os.makedirs(output_dir, exist_ok=True)

        content, output_path = generate_test_file(target_abs, framework, output_dir)

        if os.path.exists(output_path):
            print(f"[SKIP] 测试文件已存在，不覆盖：{output_path}", file=sys.stderr)
            continue

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"[OK] 已生成测试文件：{output_path}")
        generated.append(output_path)

    if not generated:
        print("[INFO] 未生成任何新测试文件", file=sys.stderr)
        sys.exit(0)

    print(f"\n[完成] 共生成 {len(generated)} 个测试文件：")
    for p in generated:
        print(f"  - {p}")
    print(f"\n运行测试：npx {framework} run")


if __name__ == "__main__":
    main()
