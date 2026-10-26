import { AxeBuilder } from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";
import { expect, open, test } from "./fixtures";

test("head", async ({ page }) => {
  await page.goto("/");
  const head = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    title: document.title,
    description: document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content"),
    viewport: document
      .querySelector('meta[name="viewport"]')
      ?.getAttribute("content"),
    preloads: [
      ...document.querySelectorAll<HTMLLinkElement>('link[rel="preload"]'),
    ].map((link) => ({
      as: link.as,
      type: link.type,
      file: link.href.split("/").pop(),
    })),
  }));
  expect(JSON.stringify(head, null, 2)).toMatchSnapshot("head.json");
});

test("accessibility tree", async ({ page }) => {
  await open(page);
  await expect(page.locator("body")).toMatchAriaSnapshot({
    name: "page.aria.yml",
  });
});

test("the sound toggle remembers the choice", async ({ page }) => {
  await page.goto("/");
  const sound = page.getByRole("button", { name: "Sound" });
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await page.reload();
  await expect(sound).toHaveAttribute("aria-pressed", "false");
});

test("the header gets a rule when the page scrolls", async ({ page }) => {
  await page.goto("/");
  const header = page.getByRole("banner");
  const rule = () =>
    header.evaluate((element) => getComputedStyle(element).borderBottomColor);
  const before = await rule();
  await page.evaluate(() => {
    window.scrollTo({ top: 400, behavior: "instant" });
  });
  await expect.poll(rule).not.toBe(before);
});

test("charts draw when they scroll into view", async ({ page }) => {
  await page.goto("/");
  const bar = page.getByRole("figure").first().locator("rect").first();
  const transform = () =>
    bar.evaluate((element) => getComputedStyle(element).transform);
  expect(await transform()).not.toBe("none");
  await bar.scrollIntoViewIfNeeded();
  await expect.poll(transform, { timeout: 5000 }).toBe("none");
});

test("a plate squashes when clicked", async ({ page }) => {
  await page.goto("/");
  const plate = page.getByRole("link", {
    name: "Udemy Reset Progress",
    exact: true,
  });
  await plate.click();
  expect(
    await plate.evaluate((element) => element.getAnimations().length),
  ).toBeGreaterThan(0);
});

test("the newsletter form says nothing was saved", async ({ page }) => {
  await page.goto("/");
  const form = page
    .getByRole("button", { name: "Subscribe" })
    .locator("xpath=ancestor::form");
  await form.getByRole("button", { name: "Subscribe" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Separate from the posts on this site.",
  );
  await form.getByRole("textbox").fill("you@example.com");
  await form.getByRole("button", { name: "Subscribe" }).click();
  await expect(page.getByRole("status")).toHaveText(
    "The newsletter isn't set up yet, so your address wasn't saved. For now, follow on X.",
  );
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("charts are drawn from the start", async ({ page }) => {
    await page.goto("/");
    const bar = page.getByRole("figure").first().locator("rect").first();
    expect(
      await bar.evaluate((element) => getComputedStyle(element).transform),
    ).toBe("none");
  });

  test("a plate does not animate when clicked", async ({ page }) => {
    await page.goto("/");
    const plate = page.getByRole("link", {
      name: "Udemy Reset Progress",
      exact: true,
    });
    await plate.click();
    expect(
      await plate.evaluate((element) => element.getAnimations().length),
    ).toBe(0);
  });
});

test("axe report", async ({ page }, testInfo) => {
  await open(page);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const report = testInfo.outputPath("axe.json");
  await writeFile(report, JSON.stringify(results.violations, null, 2));
  await testInfo.attach("axe.json", { path: report });
});
