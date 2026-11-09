# Agent Skills

[中文](README.zh-CN.md) | English

`@murphy-lab/agent-skills` installs reusable Agent skills for Codex, Claude Code, and Cursor.

Bundled skills:

- `bootstrap-project-ai-governance`: production-oriented methodology v0.3.1 for project instructions, verified context, coding style, Git commit governance, design-system documentation, UI quality workflows with `design-taste-frontend` and `impeccable`, cross-Agent adapters, and executable shared project memory. These two UI skills are discovered in the target environment and are not bundled or installed automatically.
- `challenge-plan`：以反对者视角审查产品、技术或实施计划。
- `code-review`：审查 Git 提交区间，输出 P0/P1/P2 风险报告。
- `engineering-discipline`: a pinned upstream snapshot of the tool-agnostic guidelines from [coding-guidelines](https://github.com/murphycheng-24/coding-guidelines).

## Upstream Snapshots

`coding-guidelines` remains the source of truth for `engineering-discipline`. Update `vendor/engineering-discipline.json` to a reviewed upstream commit and blob SHA, then run `npm run sync:engineering-discipline`. Do not edit `skills/engineering-discipline` by hand.

## Install

```bash
npx @murphy-lab/agent-skills install bootstrap-project-ai-governance --target all --project .
npx @murphy-lab/agent-skills install challenge-plan --target all --project .
npx @murphy-lab/agent-skills install code-review --target all --project .
npx @murphy-lab/agent-skills install engineering-discipline --target all --project .
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

## Project Memory Runtime

The package also exposes a dependency-free `project-memory` CLI:

```bash
npx --yes --package @murphy-lab/agent-skills project-memory lint --project .
npx --yes --package @murphy-lab/agent-skills project-memory doctor --project . --json
```

It implements protocol v0.2 with `query`, `propose`, `apply`, `lint`, and `doctor`. Writes use SHA-256 optimistic concurrency and local events under Git metadata. Pin the package version in production projects. When memory grows, compact first, then split by real business domains, and enable index-plus-domain selective reads (with an L0 light path) in `AGENTS.md`—splitting alone without changing the read protocol yields limited token savings. Use `lint --all` / `doctor --all` when multiple memory files exist.

## Development

```bash
npm test
npm pack
```

The package has no runtime dependencies.
