# Agent Skills

`@murphy-lab/agent-skills` installs reusable Agent skills for Codex, Claude Code, and Cursor. The first bundled skill is `challenge-plan`: an adversarial review workflow for plans, with its Karpathy guidelines bundled locally.

## Install

After publishing the package to npm:

```bash
npx @murphy-lab/agent-skills install challenge-plan --target codex
npx @murphy-lab/agent-skills install challenge-plan --target claude --project .
npx @murphy-lab/agent-skills install challenge-plan --target cursor --project .
npx @murphy-lab/agent-skills install challenge-plan --target all --project .
```

`codex` installs into `$CODEX_HOME/skills` (or `~/.codex/skills`). `claude` writes a managed import to the project's `CLAUDE.md`. `cursor` creates an Agent Requested rule in `.cursor/rules`.

The installer never replaces an existing skill or Cursor rule unless `--force` is supplied:

```bash
npx @murphy-lab/agent-skills install challenge-plan --target all --project . --force
```

## Verify

```bash
npx @murphy-lab/agent-skills doctor --target all --project .
```

## Development

```bash
npm test
npm pack
```

The package has no runtime dependencies.
