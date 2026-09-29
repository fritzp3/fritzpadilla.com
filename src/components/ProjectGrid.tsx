import HalftoneImage from "@/components/HalftoneImage";
import type { ProjectView } from "@/lib/projects";
import Link from "next/link";

// Work layout "grid": thumbnail cards in an auto-filling grid.
export default function ProjectGrid({ projects }: { projects: ProjectView[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-x-[clamp(24px,4vw,48px)] gap-y-[clamp(40px,5vw,64px)] p-0">
      {projects.map((p) => (
        <li key={p.slug}>
          <Link
            href={p.href}
            className="flex flex-col gap-3.5 text-ink no-underline hover:text-accent-700"
          >
            <HalftoneImage
              src={p.thumb?.src}
              alt={p.thumb?.alt ?? ""}
              placeholder={`Thumbnail — ${p.title}`}
              sizes="(min-width: 1200px) 360px, (min-width: 768px) 50vw, 100vw"
              className="aspect-[16/10]"
            />
            <span className="text-[13px] tracking-[0.06em] text-ink/70 uppercase">
              {p.num} · {p.year} · {p.type}
            </span>
            <h3 className="m-0 text-[26px] leading-[1.2] tracking-[-0.01em]">{p.title}</h3>
            <p className="m-0 text-[15.5px] leading-[1.6] text-ink/80">{p.summary}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
