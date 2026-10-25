# 2hp: frontend stack

Status: decided 2026-10-25, nothing installed yet.

`twohour-project/` is a local design sandbox, git-ignored. `twohour-project/site/` is the approved page and the read-only reference for the port. `twohour-project/DESIGN-SYSTEM-PLAN.md` details the port.

## 1. Stack

| Area            | Pick                                                 | Why                                                                                                               |
| --------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Framework       | Astro 7, static output                               | Content site, zero JS by default, `.astro` is close to the reference HTML                                         |
| Styling         | Tailwind v4, CSS-first                               | `@theme { --*: initial; }` makes default utilities impossible                                                     |
| Language        | TypeScript 6                                         | See section 2                                                                                                     |
| Runtime         | Node 26 LTS                                          |                                                                                                                   |
| Package manager | pnpm                                                 | Release-age gating and build-script blocking on by default                                                        |
| Lint            | ESLint with the Astro and better-tailwindcss plugins | The only linter that checks Tailwind classes inside `.astro` templates against our theme; Biome and Oxlint cannot |
| Format          | Prettier with the Astro and Tailwind plugins         |                                                                                                                   |
| CSS lint        | Stylelint                                            | Bans colour literals outside the theme                                                                            |
| Repo hygiene    | Knip, lefthook, EditorConfig                         |                                                                                                                   |
| Tests           | Playwright only: pixel diffs, aria snapshots, axe    | No Storybook, no hosted visual service                                                                            |
| Agent docs      | Context7, Astro Docs MCP                             | Tailwind has no MCP or `llms.txt`                                                                                 |

## 2. Versions

- Install the latest versions. pnpm's release-age gate keeps every package at least 7 days old.
- `typescript` stays on 6 until `@astrojs/check` and typescript-eslint support TS 7.
- `@playwright/test` and the Playwright Docker image tag always change together.
- `lefthook` is pinned to 2.2.1, because 2.2.2 was published by hand without provenance. Move to the next release published by trusted publishing.
- Updates are manual, with npm-check-updates. It reads `minimumReleaseAge` from `pnpm-workspace.yaml` by itself. `.ncurc.json` rejects `typescript`. There is no update bot.

## 3. Astro rules

- **Plain by default.** Use `.astro` and a plain `<script>`. React islands only for a component that holds state across interactions. No second island framework.
- **`compressHTML: true`.** Astro 7 defaults to `'jsx'`, which drops the space between inline elements on separate lines. The port would no longer match the reference.
- **Strict HTML.** The Astro 7 compiler does not repair HTML: an unclosed tag is a build error.
- **No Fonts API.** It generates its own fallbacks. The woff2 files and `@font-face` rules move over unchanged.

## 4. Tooling

- **`pnpm check` is the definition of done**, for people, hooks and CI alike.
  - It is a plain `&&` chain in `package.json`: format check, lint, CSS lint, token lint, typecheck, knip, build and Playwright, in that order. It stops at the first failure.
  - Write a script only when a step needs logic that a chain cannot express.
- **ESLint is type-aware:** typescript-eslint `strictTypeChecked` and `stylisticTypeChecked`. `.astro` files use `project: true`, because the Astro parser does not support `projectService`.
- **Every tool ignores `twohour-project/`.**
- **lefthook:**
  - pre-commit formats and lints the staged files;
  - pre-push runs `pnpm audit --audit-level high` and then `pnpm check`;
  - its postinstall script is denied; the `prepare` script installs the hooks instead.
- **No `eslint-plugin-jsx-a11y`.** It does not support ESLint 10. Accessibility is covered by axe and the aria snapshots.

## 5. Design system enforcement

Four layers, each catching what the previous one misses:

1. **Tailwind:** `@theme { --*: initial; }`, so `bg-blue-500` does not exist.
2. **ESLint:** unknown classes are errors. Arbitrary values and `(--var)` shorthands are warnings during the port, because non-token values are parked there until cleanup. After cleanup they become errors.
3. **Stylelint:** no colour literals outside `src/styles/theme.css`.
4. **A token-lint script:** fails on hex, rgb, hsl or raw `px` outside `theme.css` in any source file, including Markdown.

Port rules:

- **Same tokens, same values.** The 29 tokens from `twohour-project/site/styles.css` keep their values. They are renamed only into Tailwind namespaces (`--color-*`, `--font-*`, `--text-*`, `--radius-*`, `--ease-*`, `--breakpoint-*`).
- **Exact breakpoints.** The reference uses `max-width: 700px` and `max-width: 1100px`, which means ≤. Tailwind's `max-*` means `<`. Define exact variants with `@custom-variant`.
- **The `style` attribute stays allowed.** The name and the charts set `--i` and `--b` per element.
- **JS hooks use `data-*` attributes**, not classes.

## 6. Tests

- **Baselines come from the reference.** Step 4 shoots `twohour-project/site/` and commits the screenshots. The reference is local only, so those baselines are what CI and the port compare against.
- **Only Docker renders baselines.** Use the Playwright image on amd64; on Apple Silicon, `--platform linux/amd64`. Never commit baselines rendered on macOS.
- **Exact comparison needs two settings:** `maxDiffPixels: 0` and `threshold: 0`. The per-pixel threshold defaults to 0.2.
- **Determinism:**
  - animations disabled;
  - fonts loaded before the shot;
  - time frozen;
  - the `AudioContext` never started;
  - charts scrolled into view first (an IntersectionObserver draws them).
- **Coverage:**
  - full pages at 320, 390, 768, 1280 and 1440;
  - Windows 150%;
  - reduced motion;
  - forced colors;
  - states: hover, focus-visible, sound off, the scrolled header, the form after submit;
  - one shot per section, so the port can be checked section by section.
- **Aria snapshots** must match exactly, not as a subset.
- **axe** checks WCAG 2.2 AA. On the reference it is a report for the owner, not a gate, because the design is frozen.

## 7. Agent harness

**Instructions**

- AGENTS.md is the single source. CLAUDE.md imports it and adds only Claude-specific notes.
- Keep both short. A rule that a hook can enforce goes into a hook, not prose.
- Knowledge goes in AGENTS.md; procedures go in skills. Agents do not reliably trigger skills on their own.

**Guards**

- **Baselines are human-only.** Agents cannot update snapshots, edit the screenshots folder, or touch `twohour-project/`.
- **The test harness is protected.** Agents cannot edit the Playwright config or the check scripts.
- **After every edit**, the file is formatted and linted, and findings go back to the agent as context without ending its turn.
- **Before the agent stops**, `pnpm check` runs and blocks the stop on failure, at most 3 times so a stuck agent can still report.
- **Security guards:** see section 8.

**Skills for the port:** one for the reference → port → diff loop, and one for running the diffs and reporting evidence.

**MCP:** Astro Docs only. Playwright runs as its CLI.

## 8. Security

**Frame:** OWASP Top 10:2025 A03 (Software Supply Chain Failures) and the OWASP Top 10 for Agentic Applications. The rest of the OWASP web Top 10 targets server code. It applies once the site has server routes.

**Threats, most likely first:**

1. **A malicious npm release.** Examples: the Shai-Hulud worms (2025–2026) and keyv 6.0.0 (Aug 2026). Signed provenance does not mean safe: the malicious TanStack releases carried valid provenance. The release-age cooldown is what stops most of these.
2. **An agent that installs, runs or persists something:** ad-hoc package runners, edited Claude Code hooks, `.vscode` tasks. Mini Shai-Hulud persisted through exactly these.
3. **Secrets on the dev machine and in CI.**
4. **Untrusted content rendered as HTML** (later, with the blog).

**Dependencies**

- A new dependency needs the owner's yes. Before asking, the agent reviews it:
  - is there a platform feature or an existing dependency that does the job;
  - the package's age, maintainers and downloads;
  - whether it has install scripts;
  - any recent change of maintainer or repository.
- pnpm keeps the 7-day release age, allows no trust downgrades and no exotic sources, and runs build scripts only from an allowlist.
- The lockfile changes only through pnpm commands. CI installs from a frozen lockfile.
- `pnpm audit` at high and critical runs on pre-push and in CI.

**Agents**

- **Forbidden commands:** `npx`, `pnpm dlx`, `curl`, `wget`. Agents cannot read `.env` files.
- **Owner-only files:** after step 5, agents cannot edit `.claude/settings*`, `.claude/hooks/`, `.vscode/`, the lefthook config or CI workflows. The owner changes these by hand.
- **Use deny rules and hooks, not ask prompts.** Bypass-permissions mode skips prompts.
- **Sandbox:** on, with network allowed only to the npm registry and GitHub.
- **Security review before commit** for any diff that touches dependencies, the lockfile, `.claude/`, hooks or CI.

**Secrets**

- None in the repo.
- `.env*` files are ignored by git and unreadable to agents.
- GitHub secret scanning and push protection go on when the remote is set up.

**Content:** no `set:html` or `innerHTML` with anything not authored in this repo.

**Later steps:**

- **CI:** actions pinned by commit SHA, read-only workflow permissions by default, no `pull_request_target`.
- **Deploy:** CSP, Trusted Types and security headers.

## 9. Steps

Each step is one commit to `main`, made after the owner's review. No step starts before the previous one is committed.

0. **Docs and ignore:** this file, and `.gitignore` with the whole `twohour-project/` ignored.
1. **Astro foundation:** Node and pnpm pinned, a hardened pnpm config, Astro with a placeholder page. Done when build and typecheck pass.
2. **Formatting and base lint:** Prettier, ESLint, Stylelint, Knip, EditorConfig, lefthook with `pnpm audit` on pre-push, the first `pnpm check`. Done when it passes and a deliberately broken file fails each tool.
3. **Tailwind and the theme:** the theme with the 29 tokens, the Tailwind lint rules, the colour bans, token lint. Done when `bg-paper` passes and `bg-blue-500` and `#fff` fail.
4. **Tests and reference baselines:** everything in section 6, against `twohour-project/site/`. Done when three runs in a row show zero diff.
5. **Agent harness:** everything in section 7, plus the agent rules and the dependency review from section 8. Done when each guard is shown to work, including a blocked `npx` and a blocked edit to `.claude/hooks/`.
6. **The port, one section per commit.** Each part is done when its shots show zero diff at every width and in every state.
   1. Layout, fonts, SVG sprite, header, sound toggle, `main.js`.
   2. Hero.
   3. The numbers.
   4. Wins & flops, and Writing.
   5. Follow along and footer. Full pages and the aria snapshot must now match too.
7. **Retire the sandbox:** remove every `twohour-project` reference from the repo: ignore lists, the tsconfig exclude, agent guards, test configs, this file. `git grep twohour-project` must come back empty.

## 10. Still to verify

- Claude Code sandbox `denyWrite` path syntax, and whether `Edit` deny rules also cover the Write tool.
- Whether an ESLint `no-restricted-syntax` selector can catch hex literals inside `.astro` attributes.
- That deny rules and PreToolUse hooks still apply in bypass-permissions mode.

## Sources

- Astro 7 upgrade guide: https://docs.astro.build/en/guides/upgrade-to/v7/
- Tailwind theme: https://tailwindcss.com/docs/theme
- better-tailwindcss: https://github.com/schoero/eslint-plugin-better-tailwindcss
- Biome language support: https://biomejs.dev/internals/language-support/
- pnpm supply chain: https://pnpm.io/supply-chain-security
- OWASP A03:2025 Software Supply Chain Failures: https://owasp.org/Top10/2025/
- OWASP Top 10 for Agentic Applications: https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026
- TanStack compromise postmortem: https://tanstack.com/blog/npm-supply-chain-compromise-postmortem
- Mini Shai-Hulud: https://www.akamai.com/blog/security-research/mini-shai-hulud-worm-returns-goes-public
- Playwright snapshots: https://playwright.dev/docs/test-snapshots
- Claude Code hooks: https://code.claude.com/docs/en/hooks
- AGENTS.md vs skills: https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals
