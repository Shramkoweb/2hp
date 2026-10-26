import {
  test as base,
  expect,
  type Locator,
  type Page,
} from "@playwright/test";
import path from "node:path";
import process from "node:process";

const root =
  process.env.TARGET === "reference" ? "twohour-project/site" : "dist";

export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route("https://2hp.test/**", (route) => {
      const { pathname } = new URL(route.request().url());
      const file = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
      return route.fulfill({ path: path.join(root, file) });
    });
    await use(context);
  },
});

export { expect };

const nextFrames = (page: Page) =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }),
  );

export async function open(page: Page) {
  await page.goto("/");
  await page.addStyleTag({
    content: "html { scroll-behavior: auto !important; }",
  });
  await page.evaluate(() => document.fonts.ready);
  for (const chart of await page.getByRole("figure").all()) {
    await chart.scrollIntoViewIfNeeded();
    await nextFrames(page);
  }
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await nextFrames(page);
}

export async function around(page: Page, target: Locator, margin = 24) {
  const box = await target.boundingBox();
  if (!box) throw new Error("Element is not visible");
  const viewport = page.viewportSize();
  const x = Math.max(0, box.x - margin);
  const y = Math.max(0, box.y - margin);
  return {
    x,
    y,
    width: Math.min(box.width + margin * 2, (viewport?.width ?? Infinity) - x),
    height: Math.min(
      box.height + margin * 2,
      (viewport?.height ?? Infinity) - y,
    ),
  };
}
