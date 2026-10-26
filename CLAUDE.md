@AGENTS.md

## Claude Code

- Bash runs in the sandbox, in strict mode: `dangerouslyDisableSandbox` is ignored, the network allowlist is the npm registry and GitHub, git over SSH fails, `node_modules/` is read-only, and `pnpm install` or `pnpm add` fail. Only `pnpm test:e2e` runs outside, because Docker cannot run inside, and only when it is the whole command: no pipes or `&&`.
- Hooks run their tools in their own sandbox (`.claude/hooks/sandbox.sb`): no network, writes only to build output, temp and the edited file.
- After every Edit or Write, a hook formats and lints the file. Its findings arrive as context: fix them before moving on.
- Before you stop, a hook runs `pnpm check` on a dirty tree and sends you back on failure, at most 3 times. After the third, stop and report what still fails.
- Skills: `visual-diff` to run the suite and report evidence.
- Docs: the Astro Docs MCP for Astro, Context7 for other libraries.
