import { defineConfig, devices } from "@playwright/test";

const chrome = devices["Desktop Chrome"];
const visual = /visual\.spec\.ts/;

export default defineConfig({
  testDir: "tests",
  snapshotPathTemplate:
    "{testDir}/__screenshots__/{testFilePath}/{projectName}/{arg}{ext}",
  fullyParallel: true,
  workers: "100%",
  forbidOnly: true,
  reporter: [["list"], ["html", { open: "never" }]],
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
  use: { baseURL: "https://2hp.test" },
  projects: [
    ...[320, 390, 768, 1024, 1440].map((width) => ({
      name: `w${String(width)}`,
      testMatch: visual,
      use: { ...chrome, viewport: { width, height: 900 } },
    })),
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
