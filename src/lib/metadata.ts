import type { Metadata } from "next";
import { hero, site } from "@/content/site";
import { ogSize } from "@/lib/og";

/** A social card exported by an og.png route handler (see app/og.png/route.tsx). */
export function ogImage(url: string, alt: string) {
  return { url, alt, type: "image/png", ...ogSize };
}

// A page's `openGraph` replaces the layout's rather than merging with it, so
// every page spreads these shared fields into its own openGraph object. Case
// studies override `images` with their own card.
export const openGraphBase = {
  siteName: site.name,
  locale: "en_US",
  images: [ogImage("/og.png", `${site.name} — ${hero.headline.join(" ")}`)],
} satisfies Metadata["openGraph"];
