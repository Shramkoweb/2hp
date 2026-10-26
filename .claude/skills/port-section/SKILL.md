---
name: port-section
description: Port one section of the reference page (twohour-project/site/) into Astro until its screenshots show zero diff. Use for every part of step 6 in STACK.md.
---

1. Read the section in `twohour-project/site/` (`index.html`, `styles.css`, `main.js`) and its baselines: `tests/__screenshots__/visual.spec.ts/*/section-<name>.png`, plus the state shots of the elements it contains.
2. Write it in `src/` by the rules in AGENTS.md. For a value that has no token, stop and ask the owner: step 6 decides how such values are held.
3. Run `pnpm build`, then `pnpm test:e2e -g "section <name>"` and read the result with the visual-diff skill.
4. Fix the largest difference first, then rebuild and rerun. Repeat until every width shows zero diff.
5. Run the state tests for the section's elements (`-g "hover|press|focus|scrolled|sound|form"`), then the full suite once.
6. Stop with a green `pnpm check` and a green suite, report as the visual-diff skill describes, and wait for the owner's review.
