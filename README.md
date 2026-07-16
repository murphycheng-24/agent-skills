# Agent Skills

[中文](README.zh-CN.md) | English

`@murphy-lab/agent-skills` installs reusable Agent skills for Codex, Claude Code, and Cursor.

Bundled skills:

- `challenge-plan`：以反对者视角审查产品、技术或实施计划。
- `code-review`：审查 Git 提交区间，输出 P0/P1/P2 风险报告。

## Install

```bash
npx @murphy-lab/agent-skills install challenge-plan --target all --project .
npx @murphy-lab/agent-skills install code-review --target all --project .
```

`codex` installs into `$CODEX_HOME/skills` (or `~/.codex/skills`). `claude` writes a managed import to the project's `CLAUDE.md`. `cursor` creates an Agent Requested rule in `.cursor/rules`.

The installer never replaces an existing skill or Cursor rule unless `--force` is supplied:

```bash
npx @murphy-lab/agent-skills install code-review --target all --project . --force
```

## Verify

```bash
npx @murphy-lab/agent-skills doctor code-review --target all --project .
```

`doctor` without a skill name continues to check `challenge-plan` for compatibility.

## Development

```bash
npm test
npm pack
```

The package has no runtime dependencies.
