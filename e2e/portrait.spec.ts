import { expect, test } from "@playwright/test";
import { about } from "../src/content/site";

test("clicking the portrait swaps it once, with no way back", async ({ page }) => {
  await page.goto("/");
  const about_ = page.locator("#about");
  const button = about_.getByRole("button", { name: about.codePortrait.label });
  await expect(about_.getByAltText(about.portrait.alt, { exact: true })).toBeVisible();

  await button.click();
  const code = about_.getByAltText(about.codePortrait.alt);
  await expect(code).toBeVisible();
  await expect(button).toHaveCount(0);
  await expect(about_.getByAltText(about.portrait.alt, { exact: true })).toHaveCount(0);

  // Further clicks do nothing; a reload restores the original.
  await code.click();
  await expect(code).toBeVisible();
  await page.reload();
  await expect(about_.getByAltText(about.portrait.alt, { exact: true })).toBeVisible();
});

test("the portrait swap works from the keyboard", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: about.codePortrait.label }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByAltText(about.codePortrait.alt)).toBeVisible();
});
