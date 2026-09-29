import HalftoneImage from "@/components/HalftoneImage";
import type { ProjectView } from "@/lib/projects";
import Link from "next/link";

// Work layout "index": numbered rows — number, title and summary, meta and
// tools, thumbnail on the right (wrapping below on narrow screens).
export default function ProjectIndex({ projects }: { projects: ProjectView[] }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-[clamp(36px,5vw,56px)] p-0">
      {projects.map((p) => (
        <li key={p.slug}>
          <Link
            href={p.href}
            className="group flex flex-wrap items-start gap-x-[clamp(24px,4vw,56px)] gap-y-5 text-ink no-underline hover:text-accent-700"
          >
            <span
              aria-hidden="true"
              className="min-w-[2ch] text-[17px] leading-9 text-ink/70 tabular-nums"
            >
              {p.num}
            </span>
            <div className="min-w-0 flex-[1_1_320px]">
              <h3 className="m-0 text-[clamp(26px,3vw,36px)] leading-[1.15] tracking-[-0.015em]">
                {p.title}
              </h3>
              <p className="mt-2.5 mb-0 max-w-[52ch] text-base leading-[1.6] text-ink/80">
                {p.summary}
              </p>
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <span className="mr-1.5 text-[13px] tracking-[0.06em] text-ink/70 uppercase">
                  {p.year} · {p.type}
                </span>
                {p.topTools.map((t) => (
                  <span key={t} className="tag tag-outline">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <HalftoneImage
              src={p.thumb?.src}
              alt={p.thumb?.alt ?? ""}
              placeholder={`Thumbnail — ${p.title}`}
              sizes="(min-width: 768px) 300px, 100vw"
              className="aspect-[16/10] basis-full sm:flex-[0_1_300px]"
            />
          </Link>
        </li>
      ))}
    </ol>
  );
}
