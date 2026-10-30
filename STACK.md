# 2hp: frontend stack

Status: steps 0 to 9 done.

The approved design was a static page in a local sandbox, now outside the repo. The port matched it pixel for pixel; the committed baselines are its record.

## 1. Stack

| Area            | Pick                                                  | Why                                                                                                               |
| --------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Framework       | Astro 7, static output                                | Content site, zero JS by default, `.astro` is plain HTML with components                                          |
| Styling         | Tailwind v4, CSS-first                                | `@theme { --*: initial; }` makes default utilities impossible                                                     |
| Language        | TypeScript 6                                          | See section 2                                                                                                     |
| Runtime         | Node 26 LTS                                           |                                                                                                                   |
| Package manager | pnpm                                                  | Release-age gating and build-script blocking on by default                                                        |
| Lint            | ESLint with the Astro and better-tailwindcss plugins  | The only linter that checks Tailwind classes inside `.astro` templates against our theme; Biome and Oxlint cannot |
| Format          | Prettier with the Astro plugin; class order in ESLint |                                                                                                                   |
| CSS lint        | Stylelint                                             | Bans colour literals outside the theme                                                                            |
| Repo hygiene    | Knip, lefthook, EditorConfig                          |                                                                                                                   |
| Tests           | Playwright only: pixel diffs, aria snapshots, axe     | No Storybook, no hosted visual service                                                                            |
| Agent docs      | Context7, Astro Docs MCP                              | Tailwind has no MCP or `llms.txt`                                                                                 |
| CI              | GitHub Actions                                        | One workflow, so the deploy waits for `pnpm check` and the Playwright suite                                       |
| Hosting         | Cloudflare, a Worker with static assets only          | The domain is already there; `_headers` sets CSP and security headers without a Worker script                     |

## 2. Versions

- Install the latest versions. pnpm's release-age gate keeps every package at least 7 days old.
- `typescript` stays on 6 until `@astrojs/check` and typescript-eslint support TS 7.
- `@playwright/test` and the Playwright Docker image always change together. The image is pinned by the digest of its multi-platform index, so a re-pushed tag cannot change what renders the baselines.
- CI pins the exact pnpm version, because the setup action fetches pnpm outside the release-age gate. It moves with the local pnpm. Node needs no setup: pnpm installs the runtime locked by `devEngines.runtime`.
- `lefthook` is pinned to 2.2.1, because 2.2.2 was published by hand without provenance. Move to the next release published by trusted publishing.
- Updates are manual, with npm-check-updates. It reads `minimumReleaseAge` from `pnpm-workspace.yaml` by itself. `.ncurc.json` rejects `typescript`. There is no update bot.

## 3. Astro rules

- **Plain by default.** Use `.astro` and a plain `<script>`. React islands only for a component that holds state across interactions. No second island framework.
- **`compressHTML: true`.** Astro 7 defaults to `'jsx'`, which drops the space between inline elements on separate lines, such as the one before the link in "or email me at".
- **Strict HTML.** The Astro 7 compiler does not repair HTML: an unclosed tag is a build error.
- **No Fonts API.** The woff2 files and the hand-tuned fallback `@font-face` rules are used as they are. Fonts and logos live in `src/assets/`, so their URLs carry a content hash and can be cached as immutable.
- **Content lives in collections.** Projects, the ledger and the posts are `file()` collections in `src/content.config.ts`, with Zod schemas and logos through `image()`. Dates are ISO and are formatted only in `src/lib/format.ts`. Order is an explicit `order` field, because `getCollection` sorts by id.

## 4. Tooling

- **`pnpm check` is the definition of done**, for people, hooks and CI alike.
  - It is a plain `&&` chain in `package.json`: type generation, format check, lint, CSS lint, token lint, typecheck, knip and build, in that order. It stops at the first failure. Type generation comes first because type-aware ESLint cannot resolve `astro:content` in a fresh clone, which has no `.astro/`. Playwright stays outside it, because Docker cannot run in the agent sandbox; run `pnpm test:e2e` after `pnpm build`.
  - ESLint runs without `--cache`, because type-aware results depend on other files and the cache only watches the linted file.
  - `pnpm test:e2e` runs Playwright in the pinned Docker image, with no network and the repo mounted read-only; only `.playwright/` (results and report) is writable, so `--update-snapshots` fails.
  - `pnpm test:e2e:write` is the same run with the repo writable, for the owner's baseline updates: once with `--update-snapshots`, once without to write the aria snapshot that the update skips.
  - Write a script only when a step needs logic that a chain cannot express.
- **ESLint is type-aware:** typescript-eslint `strictTypeChecked` and `stylisticTypeChecked`. `.astro` files use `project: true`, because the Astro parser does not support `projectService`. `src/jsx.d.ts` narrows Astro's `JSX.Element` to `HTMLElement`: with Astro's `HTMLElement | any`, the typed rules read JSX inside `.astro` maps as an error type.
- **lefthook:**
  - pre-commit formats and lints the staged files;
  - pre-push runs `pnpm audit --audit-level high` and then `pnpm check`;
  - its postinstall script is denied; the `prepare` script installs the hooks instead.
- **No `eslint-plugin-jsx-a11y`.** It does not support ESLint 10. Accessibility is covered by axe and the aria snapshots.

## 5. Design system enforcement

**Colours have two tiers, following the shadcn convention:**

- **Primitives** (`--white`, `--neutral-*`, `--blue-*`) live in `:root` and create no classes.
- **Semantic tokens** (`--background`, `--foreground`, `--foreground-hover`, `--muted-foreground`, `--inverse-foreground`, `--placeholder`, `--card`, `--border`, `--primary`, `--primary-foreground`, `--accent`, `--ring`, `--chart`, `--pencil`, `--annotation`) point at primitives. `@theme inline` turns them into classes such as `bg-primary`.
- **Components use semantic tokens only:** classes, or `var(--primary)` in component CSS.
- **A dark theme or a rebrand only changes semantic values.**
- **Fit-to-width text keeps a rem floor.** A size from `vw` alone ignores browser zoom (WCAG 1.4.4, failure F94); the floor sits just below the smallest size the formula gives at 320px, so it only acts when the reader zooms.
- **The scales follow the 2026 research** (Tailwind v4, shadcn, Radix, Material 3, Carbon, Primer): type 15/17/19/21/24/28px and 44px for the plate numeral, plus fluid display roles that carry their own line height, tracking and weight; line heights 0.92/1/1.1/1.2/1.35/1.55; tracking −0.01/−0.02/−0.03em (+0.02 for Oi); weights 400–800 in steps of 100; radii from one `--radius`; borders 1/2/3px; durations 150/200/300/500ms.
- **Hard shadows keep their footprint.** An element's translate plus its shadow offset equals the resting offset: hover −2 + 8 = 6, press +4 + 2 = 6.
- **Primitives are OKLCH.** Each converts back to its original hex exactly, and the suite showed no diff. White stays hex: `oklch(100% 0 0)` shifts text antialiasing.

Four layers, each catching what the previous one misses:

1. **Tailwind:** `@theme static { --*: initial; }`, and only `tailwindcss/utilities.css` is imported, scanning `src/` only. Default classes such as `bg-blue-500` do not exist. Spacing is Tailwind's numeric scale on a 4px base: whole steps, plus 0.5 and 1.5 (2px and 6px) for optical nudges. The named spacing tokens are semantic: `pad`, `nav-h`, `hero-top`, `section`, `col-2`, `chart-inset` and the aside anchors. There is no preflight; `global.css` sets the few base rules the page needs.
2. **ESLint (`better-tailwindcss`):**
   - Errors: unknown classes, arbitrary values and `(--var)` shorthands.
   - Also errors, and autofixed: class order, duplicate classes and extra whitespace.
   - Class order lives in ESLint rather than in a Prettier plugin, because `prettier-plugin-tailwindcss` cannot sort `.astro` with `prettier-plugin-astro` 1.x.
   - **Styles live in three files.** `theme.css` holds every token and is the only place for literal values. `global.css` holds the fonts, the base rules, the `scrolled` variant and the `@utility` patterns Tailwind has no utility for (grid templates, a one-sided dashed border, transitions). `effects.css` holds what utilities cannot express: the name's letter layers, the chart's draw-in and the keyframes; its classes stay in the markup as hooks, and ESLint's `detectComponentClasses` keeps them known. Everything else is utilities in the markup. Not in an Astro `<style>`: ESLint cannot see those classes.
3. **Stylelint:** no colour literals, no `px` or `rem` and no width media queries outside `src/styles/theme.css`; breakpoints elsewhere are `@variant md` and friends. In `theme.css`, no token in `--fill-*`, `--stroke-*` (except `--stroke-width-*`) or `--*-color-*`: Tailwind reads those as colours, so a width there turns `stroke-x` into an invalid `stroke`.
4. **`pnpm lint:tokens`:** a `grep` over every file under `src/` outside `theme.css`, including templates and Markdown, and a name check on `theme.css`. It fails on:
   - hex colours and colour functions;
   - `var()` of a colour primitive;
   - spacing steps other than whole numbers, 0.5 and 1.5;
   - a size or width in `theme.css` (`--text-*`, `--border-width-*`, `--outline-width-*`, `--stroke-width-*`) named like a colour: `text-x`, `border-x`, `outline-x` and `stroke-x` resolve to the colour, and the size becomes unreachable.

Rules:

- **Breakpoints (owner's decision, 2026-10-25, from US device data):**
  - phone below 768 (designed at 390), tablet 768–1023, desktop 1024–1439, wide from 1440;
  - `theme.css` sets them as `md`, `lg` and `xl` in px; everything else reaches them only through Tailwind variants, mobile-first;
  - the pencil note beside the name shows only on wide screens.
- **The `style` attribute stays allowed.** The name and the charts set `--i` and `--b` per element.
- **JS hooks use `data-*` attributes**, not classes.

## 6. Tests

- **Baselines came from the reference.** Step 4 shot the reference page and committed the screenshots. Since step 7 the port is the source of truth: baselines change only from `dist/`, after the owner approves the change.
- **Only Docker renders baselines.** Use the Playwright image on amd64; on Apple Silicon, `--platform linux/amd64`. Never commit baselines rendered on macOS.
- **Baselines are byte-exact.** Prettier ignores `tests/__screenshots__/`: the pre-commit hook once added a final newline to `head.json`, and the test failed against its own baseline.
- **Exact comparison needs two settings:** `maxDiffPixels: 0` and `threshold: 0`. The per-pixel threshold defaults to 0.2.
- **Determinism:**
  - animations disabled;
  - fonts loaded before the shot;
  - smooth scrolling switched off, because a scroll still in motion shifts elements by a fraction of a pixel;
  - clips for hover and press measured before the interaction, because the element moves during it;
  - charts scrolled into view first, because an IntersectionObserver draws them.
- **Selectors are roles and accessible names,** not class names, so markup and styling refactors do not break the tests.
- **Coverage:**
  - full pages and every section at 390, 768, 1024 and 1440 (one per tier) and 320 (the smallest phone). Tier edges need no widths of their own, because breakpoints live only in the theme and arbitrary variants are lint errors;
  - full pages and every section in Firefox and WebKit at 390 and 1440. Their baselines were rendered from the port, not the reference, and checked by eye against Chromium (2026-10-26). WebKit uses Desktop Safari, so it shoots at device scale 2;
  - Windows 150% at 1280×610;
  - reduced motion and forced colors at 1440;
  - states at 1440: one shot for every state selector in the CSS (`:hover`, `:active`, `:focus-visible`, `[aria-pressed]`, `.scrolled`); plus the form after submit. Post titles have no hover state yet, because the posts are drafts without links;
  - the focus order of every focusable element, with a shot of its ring;
  - one shot per section, so a change can be checked section by section.
- **Behaviour tests for `main.ts`:**
  - the sound toggle (`aria-pressed`, and the saved choice surviving a reload);
  - the header's scroll class;
  - charts drawing when scrolled into view, and skipped under reduced motion;
  - the plate click;
  - the mail form status line.
- **Head snapshot:** `lang`, title, meta description, viewport, font preloads (file names without the build hash).
- **Aria snapshots** must match exactly, not as a subset.
- **axe** checks WCAG 2.2 AA and fails on any violation; the report is attached to the run.

## 7. Agent harness

**Instructions**

- AGENTS.md is the single source. CLAUDE.md imports it and adds only Claude-specific notes.
- Keep both short. A rule that a hook can enforce goes into a hook, not prose.
- Knowledge goes in AGENTS.md; procedures go in skills. Agents do not reliably trigger skills on their own.

**Guards**

- **Baselines are human-only.** Agents cannot update snapshots or edit the screenshots folder.
- **The test harness is protected.** Agents cannot edit the Playwright config or the tests.
- **After every edit**, the file is formatted and linted, and findings go back to the agent as context without ending its turn.
- **Before the agent stops**, `pnpm check` runs and blocks the stop on failure, at most 3 times so a stuck agent can still report.
- **Security guards:** see section 8.

**Skills:** one for running the diffs and reporting evidence. The port skill was removed in step 7.

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
- **Owner-only files:** after step 5, agents cannot edit `.claude/`, `.mcp.json`, `tests/`, `playwright.config.ts`, the lockfile, `node_modules/`, `.pnpmfile.*`, `pnpm-workspace.yaml`, `.npmrc`, `lefthook.yml`, `.vscode/`, CI workflows or git hooks. Lint, format and TypeScript configs and `package.json` were opened to agents on 2026-10-26 (owner's decision): locking them cost more than it protected, since every change shows in review and installs still fail in the sandbox. The owner changes these by hand, installs dependencies, and runs `!` commands, which are unsandboxed.
- **Use deny rules and hooks, not ask prompts.** Bypass-permissions mode skips prompts.
- **Sandbox:** on and strict (`allowUnsandboxedCommands: false`, `failIfUnavailable`), with the network allowlist set to the npm registry and GitHub.
  - Docker cannot run inside it, so `pnpm test:e2e` is the only excluded command. It matches only when it is the whole command, and its read-only mount keeps it from writing what the sandbox would block.
  - Anything an agent can write and something unsandboxed later executes is an escape. Tested: a `.pnpmfile.mjs` written in the sandbox ran outside it through `pnpm test:e2e`, because pnpm's `verifyDepsBeforeRun` defaults to `install`. So `.pnpmfile.*` and `node_modules/` are write-denied, and agent sessions set `pnpm_config_verify_deps_before_run=error`.
  - Hooks run unsandboxed and the Stop hook builds agent-written code, so hook tools run under `sandbox-exec` with `.claude/hooks/sandbox.sb`: no network, writes only to `dist/`, `.astro/`, temp and the edited file.
  - With `node_modules/` read-only, `prettier --cache` silently skips its cache and the Vite dev server cannot run; agents test against `dist/`. Astro's `cacheDir` is `.astro/cache`, because the content layer writes its data store there. Vite's cache is `.astro/cache/vite`: in `node_modules/.vite`, a cache left by an unsandboxed run made every sandboxed build fail.
  - `Read` and `Edit` deny rules also feed the sandbox, so one rule guards the file tools and every Bash process. `Edit` rules cover the Write tool.
  - In bypass mode, hosts outside the allowlist are allowed unless `sandbox.network.strictAllowlist` is on. A repo cannot set it: it goes in the owner's user settings, and then the user-level `allowedDomains` apply instead of the repo's.
  - Credential folders (`~/.ssh`, `~/.aws`, `~/.config/gh`, Docker's config) are denied by `Read` rules. The sandbox's own `credentials` key is ignored in repo settings.
  - Agent sessions set `pnpm_config_pm_on_fail=error`. With the default, pnpm locks its engine store under `~/Library/pnpm` on every run. That store must stay outside the sandbox, because hooks and the owner's terminal run pnpm from it unsandboxed.
- **Deny rules and hooks hold in bypass mode;** permission prompts and protected-path checks do not. Hook commands run unsandboxed.
- **Security review before commit** for any diff that touches dependencies, the lockfile, `.claude/`, hooks or CI.

**Secrets**

- None in the repo.
- `.env*` files are ignored by git and unreadable to agents.
- GitHub secret scanning and push protection go on when the remote is set up.

**Content:** no `set:html` or `innerHTML` with anything not authored in this repo.

**CI and deploy:**

- Actions pinned by commit SHA, read-only workflow permissions by default, no `pull_request_target`.
- The Cloudflare API token can deploy only this Worker. It is a secret of a GitHub environment that only `main` can use, and only the deploy job reads it: the jobs that install and test never see it.
- A token limited to one Worker cannot create it, so the owner creates the Worker.
- `wrangler` is a dev dependency, so it comes from the lockfile under the release-age gate, not from an ad-hoc install in CI.
- CSP, Trusted Types and security headers.

## 9. Steps

Each step is one commit to `main`, made after the owner's review. No step starts before the previous one is committed.

0. **Docs and ignore:** this file, and `.gitignore` with the design sandbox ignored.
1. **Astro foundation:** Node and pnpm pinned, a hardened pnpm config, Astro with a placeholder page. Done when build and typecheck pass.
2. **Formatting and base lint:** Prettier, ESLint, Stylelint, Knip, EditorConfig, lefthook with `pnpm audit` on pre-push, the first `pnpm check`. Done when it passes and a deliberately broken file fails each tool.
3. **Tailwind and the theme:** the theme with every reference token, the Tailwind lint rules, the colour bans, token lint. Done when `bg-paper` passes and `bg-blue-500` and `#fff` fail.
4. **Tests and reference baselines:** everything in section 6, against the reference page. Done when three runs in a row show zero diff.
5. **Agent harness:** everything in section 7, plus the agent rules and the dependency review from section 8. Done when each guard is shown to work, including a blocked `npx` and a blocked edit to `.claude/hooks/`.
6. **The port, one section per commit.** Each part is done when its shots show zero diff at every width and in every state.
   1. Layout, fonts, SVG sprite, header, sound toggle, `main.ts`.
   2. Hero.
   3. The numbers.
   4. Wins & flops, and Writing.
   5. Follow along and footer. Full pages and the aria snapshot must now match too. Then a fresh agent, given only the reference files and the port, lists anything in the reference that no test covers and the port lacks.
7. **Retire the sandbox:** the owner moved it out of the repo (2026-10-26). Every reference to it goes: ignore lists, the tsconfig exclude, the agent guard, the tests' reference mode, the port skill and these docs. Baselines change only from the port. Done when `git grep` finds neither the sandbox's folder name nor the reference-mode variable, and the suite is green.
8. **Token cleanup: end the port's styling.**
   - Goal: every visual value comes from a theme token, as a utility in the markup or through `var()` in one small CSS file for effects only CSS can express (the name's letter layers, chart text, keyframes). Breakpoints only as theme variants, mobile-first. A repeated pattern exists once, as a token or an `@utility`.
   - Order: work that changes no pixel first (dead code, the theme layer, breakpoint variants, values that already equal a token, shared utilities, then each section converted and its CSS file deleted); value changes after.
   - Each value change is one owner-approved commit. Its visual diff must show that change and nothing else. Baselines are updated only after approval.
   - Done when `src/styles/` holds only `theme.css`, `global.css` and the effects file; Stylelint bans `px` and `rem` outside `theme.css`; no `@media (width …)` exists outside `theme.css`; the `utilities` layer holds only classes used on purpose; and the suite is green three times in a row.
9. **DESIGN.md:** which token to use when, the components and their states. Only token names, never values.
10. **CI:** one GitHub Actions workflow on pushes and pull requests: an install from the frozen lockfile, `pnpm audit` at high, `pnpm check`, then `pnpm test:e2e` as it runs locally. Done when the push of this step runs green and a deliberately broken commit on a branch runs red.
11. **Deploy:** `dist/` served on `twohourproject.com` by a Worker with static assets only. A deploy job in the CI workflow runs on `main` only after check and e2e pass. Headers come from `_headers` in `public/`. `wrangler` needs the dependency review and the owner's yes; the owner creates the Worker, the token and the environment secret. Done when the domain serves the build, a red run deploys nothing, and the live page logs no CSP violation.

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
- Claude Code sandbox: https://code.claude.com/docs/en/sandboxing
- Claude Code permissions: https://code.claude.com/docs/en/permissions
- pnpm `pmOnFail`: https://pnpm.io/settings#pmonfail
- AGENTS.md vs skills: https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals
- Cloudflare static assets headers: https://developers.cloudflare.com/workers/static-assets/headers/
- Cloudflare Workers API token scopes: https://developers.cloudflare.com/workers/authorization/
