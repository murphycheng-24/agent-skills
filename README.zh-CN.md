# Agent Skills

[English](README.md) | 中文

`@murphy-lab/agent-skills` 用于将可复用的 Agent skill 安装到 Codex、Claude Code 和 Cursor。

内置 skill：

- `bootstrap-project-ai-governance`：生产化方法论 v0.3，建立项目约束、已验证上下文、coding style、Git commit governance、design system、跨 Agent 入口和可执行共享项目记忆。
- `challenge-plan`：以反对者视角审查产品、技术或实施计划。
- `code-review`：审查 Git 提交区间，输出 P0/P1/P2 风险报告。
- `engineering-discipline`：来自 [coding-guidelines](https://github.com/murphycheng-24/coding-guidelines) 的固定上游快照，提供工具无关的工程纪律规则。

## 上游快照

`coding-guidelines` 是 `engineering-discipline` 的唯一源码。更新时先将 `vendor/engineering-discipline.json` 改为已审核的上游 commit 与 blob SHA，再运行 `npm run sync:engineering-discipline`；禁止手工编辑 `skills/engineering-discipline`。

## 安装

```bash
npx @murphy-lab/agent-skills install bootstrap-project-ai-governance --target all --project .
npx @murphy-lab/agent-skills install challenge-plan --target all --project .
npx @murphy-lab/agent-skills install code-review --target all --project .
npx @murphy-lab/agent-skills install engineering-discipline --target all --project .
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

## 项目记忆 Runtime

本包同时提供无 runtime dependency 的 `project-memory` CLI：

```bash
npx --yes --package @murphy-lab/agent-skills project-memory lint --project .
npx --yes --package @murphy-lab/agent-skills project-memory doctor --project . --json
npx --yes --package @murphy-lab/agent-skills project-memory lint --project . --all
```

protocol v0.2 支持 `query`、`propose`、`apply`、`lint` 和 `doctor`。写入使用 SHA-256 乐观并发控制，运行事件保存在 Git metadata 下。生产项目应固定 npm 包版本。

记忆膨胀时的推荐路径：先整理压缩与去重 → 按真实业务域拆分分册 → 在 `AGENTS.md` 启用「入口 + 相关分册」按域读取/写回（并保留 L0 轻路径）。只拆分但不改读取协议，token 收益有限。

## 开发

```bash
npm test
npm pack
```

本包没有运行时依赖。
