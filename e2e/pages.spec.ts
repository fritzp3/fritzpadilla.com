import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { routes, widths } from "./routes";

test("sitemap lists the home page and at least one case study", () => {
  expect(routes).toContain("/");
  expect(routes.some((r) => r.startsWith("/work/"))).toBe(true);
});

for (const route of routes) {
  test.describe(`page ${route}`, () => {
    test("renders with one h1, a title and a canonical URL", async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page).toHaveTitle(/Fritz Padilla/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://fritzpadilla.com${route}`,
      );
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    });

    test("never scrolls horizontally", async ({ page }) => {
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(0);
      }
    });

    for (const width of [375, 1280]) {
      test(`has no WCAG A/AA violations at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          // .plate spans are aria-hidden decorative repeats of the .paper text.
          .exclude(".plate")
          .analyze();
        expect(results.violations).toEqual([]);
      });
    }
  });
}

test("404 page renders", async ({ page }) => {
  await page.goto("/404.html");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("isn’t in print");
  await expect(page.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
});
