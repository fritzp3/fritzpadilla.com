import type { Metadata } from "next";
import Link from "next/link";
import HalftoneImage from "@/components/HalftoneImage";
import Illustration from "@/components/Illustration";
import LeaderRow from "@/components/LeaderRow";
import PlateHeadline from "@/components/PlateHeadline";
import ProjectGrid from "@/components/ProjectGrid";
import ProjectIndex from "@/components/ProjectIndex";
import SectionLabel from "@/components/SectionLabel";
import { about, contact, glance, hero, settings, site } from "@/content/site";
import { openGraphBase } from "@/lib/metadata";
import { getProjects, getYearRange } from "@/lib/projects";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    ...openGraphBase,
    type: "website",
    url: "/",
    title: site.name,
    description: site.description,
  },
};

// schema.org Person, per the Next.js JSON-LD guide ("<" escaped against XSS).
function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: site.url,
    jobTitle: site.jobTitle,
    email: `mailto:${site.email}`,
    description: site.description,
    ...(about.portrait.src && { image: `${site.url}${about.portrait.src}` }),
    ...(site.profiles.length > 0 && { sameAs: site.profiles }),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export default function Home() {
  const projects = getProjects();

  return (
    <>
      <PersonJsonLd />
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="pt-[clamp(56px,10vw,112px)] pb-[clamp(40px,7vw,84px)]">
        <div className="flex flex-wrap items-center gap-x-[clamp(32px,5vw,80px)] gap-y-12">
          <div className="min-w-0 flex-[1_1_340px]">
            <PlateHeadline
              lines={hero.headline}
              plates={settings.headlinePlates}
              className="m-0 ml-[-0.035em] max-w-[16ch] text-[clamp(42px,6.4vw,84px)] leading-[1.08] tracking-[-0.02em]"
            />
            <p className="mt-9 mb-0 max-w-[56ch] text-[19px] leading-[1.6]">{hero.intro}</p>
            <div className="mt-8 flex flex-wrap gap-(--space-3)">
              <Link href="/#work" className="btn btn-primary">
                See the work
              </Link>
              <Link href="/#about" className="btn btn-ghost">
                About me
              </Link>
            </div>
          </div>
          <figure className="m-0 flex-[0_1_clamp(220px,30vw,360px)] text-ink">
            <Illustration className="block h-auto w-full overflow-visible" />
          </figure>
        </div>
      </section>

      {/* ── At a glance ──────────────────────────────────────────────── */}
      <section aria-label="At a glance" className="pb-[clamp(40px,7vw,84px)]">
        <div aria-hidden="true" className="h-[5px] border-t-2 border-b border-ink" />
        <ul className="m-0 flex list-none flex-wrap justify-between gap-x-7 gap-y-3.5 p-0 py-3.5 text-[13px] leading-[14px] tracking-[0.08em] text-ink/70 uppercase">
          {glance.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
          {settings.showAvailability && <li className="text-accent-700">{glance.availability}</li>}
        </ul>
        <div aria-hidden="true" className="border-t border-ink" />
      </section>

      {/* ── About ────────────────────────────────────────────────────── */}
      <section id="about" aria-labelledby="about-heading" className="py-[clamp(40px,6vw,84px)]">
        <SectionLabel>About</SectionLabel>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-x-[clamp(28px,5vw,80px)] gap-y-10">
          <HalftoneImage
            src={about.portrait.src}
            alt={about.portrait.alt}
            placeholder="Portrait"
            sizes="(min-width: 768px) 420px, 100vw"
            className="aspect-[4/5] max-w-[420px]"
          />
          <div>
            <h2
              id="about-heading"
              className="m-0 max-w-[20ch] text-[clamp(28px,3vw,36px)] leading-[1.2] tracking-[-0.015em]"
            >
              {about.heading}
            </h2>
            {about.paragraphs.map((para, i) => (
              <p
                key={i}
                className={`mb-0 max-w-[58ch] text-[17px] leading-[1.65] text-ink/85 ${i === 0 ? "mt-6" : "mt-4"}`}
              >
                {para}
              </p>
            ))}
            <div className="mt-8 max-w-[520px]">
              {about.skills.map((s) => (
                <LeaderRow
                  key={s.area}
                  label={s.area}
                  value={s.detail}
                  valueClassName="text-ink/75"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Work ─────────────────────────────────────────────────────── */}
      <section id="work" aria-labelledby="work-heading" className="py-[clamp(40px,6vw,84px)]">
        <SectionLabel as="h2" id="work-heading">
          Selected work, {getYearRange()}
        </SectionLabel>
        {settings.workLayout === "grid" ? (
          <ProjectGrid projects={projects} />
        ) : (
          <ProjectIndex projects={projects} />
        )}
      </section>

      {/* ── Contact ──────────────────────────────────────────────────── */}
      <section
        id="contact"
        aria-labelledby="contact-heading"
        className="pt-[clamp(56px,8vw,112px)] pb-[clamp(40px,6vw,72px)]"
      >
        <SectionLabel>Contact</SectionLabel>
        <h2
          id="contact-heading"
          className="m-0 max-w-[18ch] text-[clamp(32px,4.4vw,56px)] leading-[1.1] tracking-[-0.02em]"
        >
          {contact.heading}
        </h2>
        <p className="mt-5 mb-0 max-w-[52ch] text-[17px] leading-[1.65] text-ink/85">
          {contact.body}
        </p>
        <p className="mt-7 mb-0 text-[clamp(22px,2.6vw,30px)]">
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
        <ul className="m-0 mt-5 flex list-none flex-wrap gap-x-7 gap-y-2 p-0 text-base">
          {contact.links.map((l) => (
            <li key={l.label}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
