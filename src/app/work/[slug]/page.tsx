import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import HalftoneImage from "@/components/HalftoneImage";
import LeaderRow from "@/components/LeaderRow";
import ProjectImage from "@/components/ProjectImage";
import SectionLabel from "@/components/SectionLabel";
import { settings } from "@/content/site";
import { ogImage, openGraphBase } from "@/lib/metadata";
import { getNextProject, getProject, getProjects } from "@/lib/projects";

// Static export: only the slugs in src/content/projects/*.md exist.
export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: p.href },
    openGraph: {
      ...openGraphBase,
      type: "article",
      title: p.title,
      description: p.summary,
      url: p.href,
      images: [ogImage(`${p.href}og.png`, `${p.title} — case study`)],
    },
  };
}

const sectionPad = "pt-[clamp(48px,7vw,84px)]";

function ExternalButton({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {children} <span aria-hidden="true">↗</span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

export default async function CaseStudy(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const p = getProject(slug);
  if (!p) notFound();
  const next = getNextProject(slug);

  const meta = [
    ["Role", p.role],
    ["Client", p.client],
    ["Year", p.year],
    ["Duration", p.duration],
    ["Team", p.team],
    ["Type", p.type],
  ];

  return (
    <article className="pt-[clamp(32px,5vw,56px)]">
      <Link href="/#work" className="text-[15px] no-underline">
        ← All work
      </Link>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <p className="mt-[clamp(36px,6vw,64px)] mb-4 text-[13px] tracking-[0.08em] text-ink/70 uppercase">
        Case study № {p.num} · {p.type}
      </p>
      <h1 className="m-0 ml-[-0.035em] max-w-[18ch] text-[clamp(38px,5.6vw,72px)] leading-[1.08] tracking-[-0.02em]">
        {p.title}
      </h1>
      <p className="mt-6 mb-0 max-w-[58ch] text-[19px] leading-[1.6]">{p.summary}</p>

      {/* ── Facts ──────────────────────────────────────────────────── */}
      <div className="mt-[clamp(36px,5vw,56px)]">
        <div aria-hidden="true" className="h-[5px] border-t-2 border-b border-ink" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-x-[clamp(28px,5vw,70px)] py-3.5">
          {meta.map(([k, v]) => (
            <LeaderRow
              key={k}
              label={k}
              value={v}
              labelClassName="text-[13px] tracking-[0.08em] text-ink/70 uppercase"
            />
          ))}
        </div>
        <div aria-hidden="true" className="border-t border-ink" />
        {(p.live || p.repo) && (
          <div className="mt-6 flex flex-wrap gap-(--space-3)">
            {p.live && (
              <ExternalButton href={p.live} className="btn btn-primary">
                Visit live site
              </ExternalButton>
            )}
            {p.repo && (
              <ExternalButton href={p.repo} className="btn btn-ghost">
                View source
              </ExternalButton>
            )}
          </div>
        )}
      </div>

      {/* ── Project image ──────────────────────────────────────────── */}
      <ProjectImage
        src={p.image?.src}
        alt={p.image?.alt ?? ""}
        placeholder={`Project image — ${p.title}`}
        className="mt-[clamp(48px,7vw,84px)]"
      />

      {/* ── Story ──────────────────────────────────────────────────── */}
      <section aria-label="Story" className={sectionPad}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-x-[clamp(28px,4vw,64px)] gap-y-10">
          {p.story.map((s) => (
            <div key={s.heading}>
              <h2 className="m-0 text-2xl leading-[1.2] tracking-[-0.01em]">{s.heading}</h2>
              {/* Rendered at build time from the project's own Markdown file. */}
              <div
                className="mt-3.5 text-justify text-[15.5px] leading-[1.8] hyphens-auto text-ink/85 [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&>*]:m-0 [&>*+*]:mt-3.5"
                dangerouslySetInnerHTML={{ __html: s.html }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Tools ──────────────────────────────────────────────────── */}
      <section aria-labelledby="tools-heading" className={sectionPad}>
        <SectionLabel as="h2" id="tools-heading">
          Built with
        </SectionLabel>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {p.tools.map((t) => (
            <li key={t} className="tag tag-accent px-3 py-[5px] text-[13px]">
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Screenshots ────────────────────────────────────────────── */}
      {settings.showScreenshots && p.shots.length > 0 && (
        <section aria-labelledby="shots-heading" className={sectionPad}>
          <SectionLabel as="h2" id="shots-heading">
            Screenshots
          </SectionLabel>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] gap-x-[clamp(24px,4vw,48px)] gap-y-10">
            {p.shots.map((sh, i) => (
              <figure key={i} className="m-0">
                <HalftoneImage
                  src={sh.src}
                  alt={sh.alt}
                  placeholder={`Screenshot — ${sh.caption}`}
                  sizes="(min-width: 1200px) 520px, (min-width: 768px) 50vw, 100vw"
                  className="aspect-[16/10]"
                />
                <figcaption className="mt-3 text-sm leading-normal text-ink/75">
                  <em>{sh.caption}</em>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ── Next project ───────────────────────────────────────────── */}
      {next.slug !== p.slug && (
        <Link
          href={next.href}
          className="block pt-[clamp(64px,9vw,120px)] pb-[clamp(40px,6vw,72px)] text-ink no-underline hover:text-accent-700"
        >
          <span className="mb-3 block text-[13px] tracking-[0.08em] text-ink/70 uppercase">
            Next project
          </span>
          <span className="block text-[clamp(30px,4vw,48px)] leading-[1.1] tracking-[-0.02em]">
            {next.title} <span aria-hidden="true">→</span>
          </span>
        </Link>
      )}
    </article>
  );
}
