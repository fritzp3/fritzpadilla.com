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

test("Google Analytics is configured but stays silent off the live domain", async ({ page }) => {
  const gaRequests: string[] = [];
  page.on("request", (req) => {
    if (/googletagmanager\.com|google-analytics\.com/.test(req.url())) gaRequests.push(req.url());
  });
  await page.goto("/");
  await expect
    .poll(() =>
      page.evaluate(() => JSON.stringify((window as { dataLayer?: unknown[] }).dataLayer)),
    )
    .toContain("G-44XPSN74LN");
  expect(gaRequests).toEqual([]);
});

test("link clicks queue nav_click and contact_email_click events", async ({ page }) => {
  await page.goto("/");
  // Keep the mailto: click from leaving the page.
  await page.evaluate(() =>
    document.addEventListener("click", (e) => {
      if ((e.target as Element).closest('a[href^="mailto:"]')) e.preventDefault();
    }),
  );
  const events = () =>
    page.evaluate(() =>
      ((window as { dataLayer?: IArguments[] }).dataLayer ?? [])
        .map((args) => Array.from(args))
        .filter((args) => args[0] === "event"),
    );
  await page.locator("nav").getByRole("link", { name: "About", exact: true }).click();
  await page.getByRole("link", { name: "See the work" }).click();
  await page.locator("main").getByRole("link", { name: /@/ }).click();
  await expect.poll(events).toEqual([
    ["event", "nav_click", { link_text: "About", link_url: "/#about", link_location: "nav" }],
    [
      "event",
      "nav_click",
      { link_text: "See the work", link_url: "/#work", link_location: "page" },
    ],
    [
      "event",
      "contact_email_click",
      {
        link_text: "hello@fritzpadilla.com",
        link_url: "mailto:hello@fritzpadilla.com",
        link_location: "page",
      },
    ],
  ]);
});
