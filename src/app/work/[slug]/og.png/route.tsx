import { site } from "@/content/site";
import { getProject, getProjects } from "@/lib/projects";
import { renderCard } from "@/lib/og";

// Each case study's social card, exported as out/work/<slug>/og.png.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function GET(_req: Request, ctx: RouteContext<"/work/[slug]/og.png">) {
  const { slug } = await ctx.params;
  const p = getProject(slug)!;
  return renderCard({
    kicker: `Case study № ${p.num} · ${p.type}`,
    lines: [p.title],
    footer: `${site.name} · fritzpadilla.com`,
  });
}
