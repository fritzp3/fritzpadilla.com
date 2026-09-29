import { expect, test } from "@playwright/test";

const mOffset = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    Number(document.querySelector('feOffset[data-plate="m"]')!.getAttribute("dx")),
  );

test("hovering a case-study print eases the plates into register", async ({ page }) => {
  await page.goto("/");
  const href = await page.locator("#work a").first().getAttribute("href");
  await page.goto(href!);
  await page.mouse.move(10, 10);
  await expect.poll(() => mOffset(page)).toBeGreaterThan(3);
  await page.locator(".cmyk .print").hover();
  await expect.poll(() => mOffset(page)).toBeCloseTo(0, 1);
});

test("pointer lean publishes --press-nx on the root", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.mouse.move(1270, 450);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue("--press-nx")))
    .not.toBe("");
});

test("the press driver stands down under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.mouse.move(1000, 400);
  await page.waitForTimeout(300);
  const nx = await page.evaluate(() =>
    document.documentElement.style.getPropertyValue("--press-nx"),
  );
  expect(nx).toBe("");
});
