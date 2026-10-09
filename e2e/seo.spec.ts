import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { routes } from "./routes";

test("home page carries valid Person structured data", async ({ page }) => {
  await page.goto("/");
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const data = JSON.parse(raw!);
  expect(data["@type"]).toBe("Person");
  expect(data.name).toBe("Fritz Padilla");
  expect(data.url).toBe("https://fritzpadilla.com");
});

test("robots.txt allows crawling and points to the sitemap", () => {
  const robots = readFileSync("out/robots.txt", "utf8");
  expect(robots).toMatch(/Allow: \//);
  expect(robots).toContain("Sitemap: https://fritzpadilla.com/sitemap.xml");
});

test("social preview images and icons are PNGs with a .png name", () => {
  const sizes: Record<string, [number, number]> = {
    "out/og.png": [1200, 630],
    "out/icons/fp-64.png": [64, 64],
    "out/icons/fp-180.png": [180, 180],
  };
  for (const route of routes.filter((r) => r.startsWith("/work/"))) {
    sizes[`out${route}og.png`] = [1200, 630];
  }
  for (const [file, size] of Object.entries(sizes)) {
    const buf = readFileSync(file);
    expect(buf.subarray(1, 4).toString(), file).toBe("PNG");
    expect([buf.readUInt32BE(16), buf.readUInt32BE(20)], file).toEqual(size);
  }
});

test("pages link the .png social card and icons", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://fritzpadilla.com/og.png",
  );
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", "/icons/fp-64.png");
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    "href",
    "/icons/fp-180.png",
  );
  const work = routes.find((r) => r.startsWith("/work/"))!;
  await page.goto(work);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    `https://fritzpadilla.com${work}og.png`,
  );
});

test("the specimen page is not indexable", () => {
  const html = readFileSync("out/specimen/index.html", "utf8");
  expect(html).toMatch(/<meta name="robots" content="noindex/);
  expect(readFileSync("out/sitemap.xml", "utf8")).not.toContain("/specimen");
});
