# 2hp

The TwoHour Project site: Astro 7, static output, Tailwind v4. `STACK.md` holds the decisions, their reasons and the step plan.

The baselines in `tests/__screenshots__/` are the record of the approved page.

## Workflow

- Work one step of `STACK.md` at a time. Stop when it is done, report what changed and how you verified it, and wait for the owner's review. Commit only after their ok, directly to `main`, as `pnpm check && git commit`. The owner pushes.
- Commit subjects are plain imperative sentences, such as "Add the agent harness".
- When something is unclear, ask instead of guessing.

## Commands

- `pnpm check` is the definition of done: format, lint, CSS lint, token lint, typecheck, knip and build.
- `pnpm test:e2e` runs Playwright in Docker against `dist/`, so run `pnpm build` first. Results and diff images go to `.playwright/`.

## Code rules

- Plain `.astro` and a plain `<script>`. A React island only for a component that holds state across interactions.
- Colours come from semantic tokens only (`bg-primary`, `var(--primary)`); never primitives or literals. No arbitrary values (`p-[13px]`, `(--x)`). The lint errors on these are the design system working, not obstacles.
- JS hooks use `data-*` attributes, not classes. The `style` attribute is for per-element custom properties such as `--i`.
- No `set:html` or `innerHTML` with anything not authored in this repo.
- Prettier puts line breaks around `{expressions}` in inline content, and Astro renders that whitespace. Where a text run must stay tight, such as a number followed by `<small>`, put `{/* prettier-ignore */}` above the element, and check the built HTML.
- Tailwind scans every word in `src/`, not just `class` attributes. A class or variable named like a utility, such as `ring`, emits that utility's CSS. After a build, the `utilities` layer in `dist/_astro/*.css` must hold only utilities used on purpose.

## Guards

These are enforced by `.claude/settings.json` and the sandbox. When one blocks you, ask the owner; do not look for a way around it.

- Baselines (`tests/__screenshots__/`) are human-only. `pnpm test:e2e` mounts the repo read-only, so `--update-snapshots` fails. If a baseline needs to change, explain why and give the owner the commands: `pnpm build`, then `pnpm test:e2e:write --update-snapshots`, then `pnpm test:e2e:write` to write the aria snapshot that the update skips, then three green runs.
- Owner-only files: `.claude/`, `.mcp.json`, `tests/`, `playwright.config.ts`, the lockfile, `node_modules/`, `.pnpmfile.*`, `pnpm-workspace.yaml`, `.npmrc`, `lefthook.yml`, `.vscode/`, CI workflows and git hooks. Lint, format and TypeScript configs and `package.json` are open, but a change that weakens a check needs the owner's yes.
- No `npx`, `pnpm dlx`, `curl` or `wget`. Use project scripts and `pnpm exec`.
- `.env` files and credential folders are unreadable.

## Dependencies

A new dependency needs the owner's yes, and the owner runs the install. Before asking, check:

- whether a platform feature or an existing dependency already does the job;
- the package's age, maintainers and weekly downloads;
- whether it, or anything it pulls in, has install scripts;
- any recent change of maintainer or repository.

## Security review

Before committing a diff that touches dependencies, the lockfile, `.claude/`, hooks or CI, run a security review of it and report the result.
