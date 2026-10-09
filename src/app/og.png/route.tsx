import { hero, site } from "@/content/site";
import { renderCard } from "@/lib/og";

// The home page's social card, exported as out/og.png. A route handler rather
// than the opengraph-image convention, which exports without a file extension.
export const dynamic = "force-static";

export function GET() {
  return renderCard({
    kicker: "fritzpadilla.com",
    lines: hero.headline,
    footer: site.name,
  });
}
