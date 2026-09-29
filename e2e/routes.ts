import { readFileSync } from "node:fs";

// Every indexable page, read from the built sitemap so tests track content.
export const routes: string[] = [
  ...readFileSync("out/sitemap.xml", "utf8").matchAll(/<loc>https:\/\/[^/]+(\/[^<]*)<\/loc>/g),
].map((m) => m[1]);

export const widths = [320, 375, 768, 1280, 1600];
