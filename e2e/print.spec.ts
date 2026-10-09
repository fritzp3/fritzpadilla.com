import { expect, test } from "@playwright/test";

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
