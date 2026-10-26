---
name: visual-diff
description: Run the Playwright suite against the build and report the evidence - counts, what differs, and the diff images. Use before claiming any visual or behaviour change is done.
---

1. Run `pnpm build`, then `pnpm test:e2e`, adding `-g "<title>"` to narrow it. The suite runs in Docker with the repo mounted read-only and no network; only `.playwright/` is writable.
2. For each failure, open `.playwright/results/<test>/`: `*-expected.png` is the approved baseline, `*-actual.png` the current build, `*-diff.png` marks differing pixels in red. Look at all three before naming a cause. Head and aria failures print a text diff instead.
3. Report:
   - the command and the passed, failed and skipped counts;
   - for each failure: the project, the test, the differing pixel count, the three image paths and what visibly differs;
   - any test skipped that was not skipped before.
4. Never change a baseline or a test to make a diff go away. If a baseline looks wrong, say why and hand the owner the commands: `pnpm test:e2e:write --update-snapshots`, then `pnpm test:e2e:write` to write the aria snapshot, then three green runs.
