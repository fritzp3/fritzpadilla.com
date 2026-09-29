import type { Metadata } from "next";
import { site } from "@/content/site";

// A page's `openGraph` replaces the layout's rather than merging with it, so
// every page spreads these shared fields into its own openGraph object.
export const openGraphBase = {
  siteName: site.name,
  locale: "en_US",
} satisfies Metadata["openGraph"];
