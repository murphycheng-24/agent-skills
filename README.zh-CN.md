# Agent Skills

[English](README.md) | 中文

`@murphy-lab/agent-skills` 用于将可复用的 Agent skill 安装到 Codex、Claude Code 和 Cursor。

内置 skill：

- `challenge-plan`：以反对者视角审查产品、技术或实施计划。
- `code-review`：审查 Git 提交区间，输出 P0/P1/P2 风险报告。

## 安装

```bash
npx @murphy-lab/agent-skills install challenge-plan --target all --project .
npx @murphy-lab/agent-skills install code-review --target all --project .
```

`codex` 会安装到 `$CODEX_HOME/skills`（或 `~/.codex/skills`）。`claude` 会向项目的 `CLAUDE.md` 写入受管理的 import。`cursor` 会在 `.cursor/rules` 中创建 Agent Requested rule。

安装器默认不会覆盖已有 skill 或 Cursor rule。如需更新，请显式传入 `--force`：

```bash
npx @murphy-lab/agent-skills install code-review --target all --project . --force
```

## 验证

```bash
npx @murphy-lab/agent-skills doctor code-review --target all --project .
```

不指定 skill 的 `doctor` 命令会继续检查 `challenge-plan`，以保持兼容。

## 开发

```bash
npm test
npm pack
```

本包没有运行时依赖。
