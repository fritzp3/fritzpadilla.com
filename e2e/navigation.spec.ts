import { expect, test, type Page } from "@playwright/test";

const navH = (page: Page) =>
  page.evaluate(() =>
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")),
  );
const headerH = (page: Page) =>
  page.evaluate(() => document.querySelector("header")!.getBoundingClientRect().height);
const sectionTop = (page: Page, id: string) =>
  page.evaluate((id) => document.getElementById(id)!.getBoundingClientRect().top, id);

for (const width of [320, 375, 768, 1280]) {
  test(`--nav-h covers the sticky header at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const [declared, actual] = [await navH(page), await headerH(page)];
    expect(declared).toBeGreaterThanOrEqual(actual);
    expect(declared - actual).toBeLessThan(8);
  });
}

test("nav links land sections just below the header", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" }); // instant scrolling
  await page.goto("/");
  for (const [label, id] of [
    ["About", "about"],
    ["Work", "work"],
  ]) {
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: label })
      .click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect.poll(() => sectionTop(page, id)).toBeCloseTo(await navH(page), -1);
  }
});

test("nav links work from a case study page", async ({ page }) => {
  await page.goto("/");
  const href = await page.locator("#work a").first().getAttribute("href");
  await page.goto(href!);
  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "About" })
    .click();
  await expect(page).toHaveURL(/\/#about$/);
  await expect(page.locator("#about")).toBeInViewport();
});

test("home links to every case study, and next-project cycles through them all", async ({
  page,
}) => {
  await page.goto("/");
  const hrefs = await page
    .locator("#work a")
    .evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  expect(hrefs.length).toBeGreaterThan(0);
  await page.goto(hrefs[0]!);
  const seen = new Set<string>();
  for (let i = 0; i < hrefs.length; i++) {
    const current = new URL(page.url()).pathname;
    seen.add(current);
    await page.getByRole("link", { name: /Next project/ }).click();
    await page.waitForURL((url) => url.pathname !== current);
  }
  expect([...seen].sort()).toEqual([...hrefs].sort());
  expect(new URL(page.url()).pathname).toBe(hrefs[0]);
});

test("skip link is the first tab stop and moves focus past the nav", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await skip.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});
