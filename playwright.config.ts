import { defineConfig, devices } from "@playwright/test";

const chrome = devices["Desktop Chrome"];
const visual = /visual\.spec\.ts/;

export default defineConfig({
  testDir: "tests",
  outputDir: ".playwright/results",
  snapshotPathTemplate:
    "{testDir}/__screenshots__/{testFilePath}/{projectName}/{arg}{ext}",
  fullyParallel: true,
  workers: "100%",
  forbidOnly: true,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: ".playwright/report" }],
  ],
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 0,
      threshold: 0,
      animations: "disabled",
      caret: "hide",
      scale: "device",
    },
    toMatchAriaSnapshot: { children: "deep-equal" },
  },
  // The fixtures and axe inject inline styles that the page's CSP blocks; page.spec.ts turns CSP back on to test it.
  use: { baseURL: "https://2hp.test", bypassCSP: true },
  projects: [
    ...[320, 390, 768, 1024, 1440].map((width) => ({
      name: `w${String(width)}`,
      testMatch: visual,
      use: { ...chrome, viewport: { width, height: 900 } },
    })),
    ...(["firefox", "webkit"] as const).flatMap((engine) =>
      [390, 1440].map((width) => ({
        name: `${engine}-w${String(width)}`,
        testMatch: visual,
        use: {
          ...devices[
            engine === "firefox" ? "Desktop Firefox" : "Desktop Safari"
          ],
          viewport: { width, height: 900 },
        },
      })),
    ),
    {
      name: "win150",
      testMatch: visual,
      use: {
        ...chrome,
        viewport: { width: 1280, height: 610 },
        deviceScaleFactor: 1.5,
      },
    },
    {
      name: "reduced",
      testMatch: visual,
      use: {
        ...chrome,
        viewport: { width: 1440, height: 900 },
        reducedMotion: "reduce",
      },
    },
    {
      name: "forced",
      testMatch: visual,
      use: {
        ...chrome,
        viewport: { width: 1440, height: 900 },
        forcedColors: "active",
      },
    },
    {
      name: "page",
      testIgnore: visual,
      use: { ...chrome, viewport: { width: 1440, height: 900 } },
    },
  ],
});
