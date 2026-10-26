import type { Locator, Page } from "@playwright/test";
import { around, expect, open, test } from "./fixtures";

type Find = (page: Page) => Locator;

const staticHeader = "tests/static-header.css";

const sections: [string, Find][] = [
  ["header", (page) => page.getByRole("banner")],
  ["hero", (page) => page.getByRole("region", { name: "TwoHour Project" })],
  ["numbers", (page) => page.getByRole("region", { name: "The numbers" })],
  ["wins", (page) => page.getByRole("region", { name: "Wins & flops" })],
  ["writing", (page) => page.getByRole("region", { name: "Writing" })],
  ["follow", (page) => page.getByRole("region", { name: "Follow along" })],
  ["footer", (page) => page.getByRole("contentinfo")],
];

const hovers: [string, Find][] = [
  [
    "nav-link",
    (page) =>
      page
        .getByRole("navigation", { name: "Main" })
        .getByRole("link", { name: "Projects" }),
  ],
  [
    "icon",
    (page) =>
      page
        .getByRole("banner")
        .getByRole("link", { name: "X: @twohourproject" }),
  ],
  ["cta", (page) => page.getByRole("link", { name: "Follow along on X" })],
  [
    "plate",
    (page) =>
      page.getByRole("link", { name: "Udemy Reset Progress", exact: true }),
  ],
  [
    "follow-x",
    (page) => page.getByRole("link", { name: /^@twohourproject on X/ }),
  ],
  ["subscribe", (page) => page.getByRole("button", { name: "Subscribe" })],
  [
    "footer-link",
    (page) =>
      page
        .getByRole("contentinfo")
        .getByRole("link", { name: "@twohourproject", exact: true }),
  ],
  [
    "footer-icon",
    (page) =>
      page
        .getByRole("contentinfo")
        .getByRole("link", { name: "Telegram, in Ukrainian" }),
  ],
];

const presses: [string, Find][] = [
  ["cta", (page) => page.getByRole("link", { name: "Follow along on X" })],
  [
    "follow-x",
    (page) => page.getByRole("link", { name: /^@twohourproject on X/ }),
  ],
];

test.beforeEach(async ({ page }) => {
  await open(page);
});

test("full page", async ({ page }) => {
  await expect(page).toHaveScreenshot("page.png", { fullPage: true });
});

for (const [name, find] of sections) {
  test(`section ${name}`, async ({ page }) => {
    await expect(find(page)).toHaveScreenshot(`section-${name}.png`, {
      stylePath: staticHeader,
    });
  });
}

test.describe("states", () => {
  test.beforeEach(({ browserName }, testInfo) => {
    test.skip(testInfo.project.name !== "w1440" || browserName !== "chromium");
  });

  for (const [name, find] of hovers) {
    test(`hover ${name}`, async ({ page }) => {
      const target = find(page);
      await target.scrollIntoViewIfNeeded();
      const clip = await around(page, target);
      await target.hover();
      await expect(page).toHaveScreenshot(`hover-${name}.png`, { clip });
    });
  }

  for (const [name, find] of presses) {
    test(`press ${name}`, async ({ page }) => {
      const target = find(page);
      await target.scrollIntoViewIfNeeded();
      const clip = await around(page, target);
      await target.hover();
      await page.mouse.down();
      await expect(page).toHaveScreenshot(`press-${name}.png`, { clip });
      await page.mouse.up();
    });
  }

  test("hover a letter of the name", async ({ page }) => {
    const name = page.getByRole("heading", { level: 1 });
    const clip = await around(page, name);
    await name.hover({ position: { x: 40, y: 60 } });
    await expect(page).toHaveScreenshot("hover-letter.png", { clip });
  });

  test("focus order and rings", async ({ page }) => {
    const order: string[] = [];
    await page.keyboard.press("Tab");
    const first = await page.evaluateHandle(() => document.activeElement);
    for (let step = 1; step <= 60; step++) {
      const focused = page.locator(":focus");
      if ((await focused.count()) === 0) break;
      if (
        step > 1 &&
        (await focused.evaluate((element, start) => element === start, first))
      )
        break;
      order.push(
        await focused.evaluate((element) => {
          const field =
            element instanceof HTMLInputElement
              ? element.labels?.[0]
              : undefined;
          const text =
            element.getAttribute("aria-label") ??
            field?.innerText ??
            (element as HTMLElement).innerText;
          return text.replace(/\s+/g, " ").trim();
        }),
      );
      await focused.scrollIntoViewIfNeeded();
      await expect(page).toHaveScreenshot(
        `focus-${String(step).padStart(2, "0")}.png`,
        {
          clip: await around(page, focused, 12),
        },
      );
      await page.keyboard.press("Tab");
    }
    expect(order.join("\n")).toMatchSnapshot("focus-order.txt");
  });

  test("sound off", async ({ page }) => {
    const sound = page.getByRole("button", { name: "Sound" });
    await sound.click();
    await page.mouse.move(0, 0);
    await expect(page).toHaveScreenshot("sound-off.png", {
      clip: await around(page, sound),
    });
  });

  test("scrolled header", async ({ page }) => {
    await page.evaluate(() => {
      window.scrollTo({ top: 400, behavior: "instant" });
    });
    const header = page.getByRole("banner");
    await expect(header).toHaveScreenshot("scrolled-header.png");
  });

  test("newsletter form after submit", async ({ page }) => {
    const form = page
      .getByRole("button", { name: "Subscribe" })
      .locator("xpath=ancestor::form");
    await form.getByRole("textbox").fill("you@example.com");
    await form.getByRole("button", { name: "Subscribe" }).click();
    await page.mouse.move(0, 0);
    await expect(form).toHaveScreenshot("form-sent.png", {
      stylePath: staticHeader,
    });
  });
});
