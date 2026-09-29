import { site } from "@/content/site";
import { getProject, getProjects } from "@/lib/projects";
import { ogSize, renderCard } from "@/lib/og";

export const dynamic = "force-static";
export const dynamicParams = false;
export const size = ogSize;
export const contentType = "image/png";
export const alt = "Case study";

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug)!;
  return renderCard({
    kicker: `Case study № ${p.num} · ${p.type}`,
    lines: [p.title],
    footer: `${site.name} · fritzpadilla.com`,
  });
}
