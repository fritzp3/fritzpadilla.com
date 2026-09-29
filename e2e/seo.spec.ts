import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

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

test("social preview images are 1200×630 PNGs", () => {
  for (const file of ["out/opengraph-image", "out/icon", "out/apple-icon"]) {
    const buf = readFileSync(file);
    expect(buf.subarray(1, 4).toString(), file).toBe("PNG");
  }
  const og = readFileSync("out/opengraph-image");
  expect([og.readUInt32BE(16), og.readUInt32BE(20)]).toEqual([1200, 630]);
});

test("the specimen page is not indexable", () => {
  const html = readFileSync("out/specimen/index.html", "utf8");
  expect(html).toMatch(/<meta name="robots" content="noindex/);
  expect(readFileSync("out/sitemap.xml", "utf8")).not.toContain("/specimen");
});
