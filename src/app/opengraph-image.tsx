import { hero, site } from "@/content/site";
import { ogSize, renderCard } from "@/lib/og";

export const dynamic = "force-static";
export const alt = `${site.name} — ${hero.headline.join(" ")}`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderCard({
    kicker: "fritzpadilla.com",
    lines: hero.headline,
    footer: site.name,
  });
}
