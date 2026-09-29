// Projects shown on the home page and as case studies at /work/<slug>/.
// Order here is display order. Derived fields (number, href, top tools) are
// computed in src/lib/projects.ts, not stored.
//
// TODO: replace the placeholder entries below with Fritz's real projects.
// Images go in public/images/projects/<slug>/ (thumb.webp 16:10, hero.webp
// 16:10, shot-1..4.webp) and are referenced by path.

export type Project = {
  slug: string;
  title: string;
  type: string;
  year: string;
  summary: string;
  role: string;
  client: string;
  duration: string;
  team: string;
  tools: string[];
  story: { heading: string; body: string }[];
  live?: string;
  repo?: string;
  thumb?: { src: string; alt: string };
  hero?: { src: string; alt: string };
  shots: { src?: string; alt: string; caption: string }[];
};

const placeholder = (n: number): Project => ({
  slug: `project-${n}`,
  title: `Project title ${n}`,
  type: "Project type",
  year: "2026",
  summary: "TODO: one or two sentences on what the project was and why it mattered.",
  role: "TODO",
  client: "TODO",
  duration: "TODO",
  team: "TODO",
  tools: ["Tool one", "Tool two", "Tool three"],
  story: [
    { heading: "The brief", body: "TODO: the problem and the constraints." },
    { heading: "The approach", body: "TODO: what you did and the key decisions." },
    { heading: "The outcome", body: "TODO: results, ideally measurable." },
  ],
  shots: [
    { alt: "", caption: "TODO: screenshot caption" },
    { alt: "", caption: "TODO: screenshot caption" },
  ],
});

export const projects: Project[] = [placeholder(1), placeholder(2), placeholder(3)];
