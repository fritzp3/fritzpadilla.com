// Projects are Markdown files in src/content/projects/, read at build time.
// The filename is the slug (project-1.md → /work/project-1/). YAML
// frontmatter holds the fields below; each `## Heading` in the body starts a
// story section. `order` sets display order. Derived fields (number, href,
// top tools) are computed here, not stored. A malformed file fails the build
// with a message naming the file and field.

import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";
import { parse as parseYaml } from "yaml";

const DIR = path.join(process.cwd(), "src/content/projects");

type Image = { src: string; alt: string };

export type Project = {
  slug: string;
  order: number;
  title: string;
  type: string;
  year: string;
  summary: string;
  role: string;
  client: string;
  duration: string;
  team: string;
  tools: string[];
  /** Story sections; `html` is rendered from the Markdown under each `##`. */
  story: { heading: string; html: string }[];
  live?: string;
  repo?: string;
  thumb?: Image;
  /** The main project image on the case-study page, shown whole. */
  image?: Image;
  shots: { src?: string; alt: string; caption: string }[];
};

export type ProjectView = Project & { num: string; href: string; topTools: string[] };

const attr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

// External links in story text open in a new tab, like the rest of the site.
const markdown = new Marked({
  renderer: {
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const t = title ? ` title="${attr(title)}"` : "";
      if (!/^https?:\/\//.test(href)) return `<a href="${attr(href)}"${t}>${text}</a>`;
      return `<a href="${attr(href)}"${t} target="_blank" rel="noopener noreferrer">${text}<span class="sr-only"> (opens in a new tab)</span></a>`;
    },
  },
});

function parseFile(file: string): Project {
  const slug = file.replace(/\.md$/, "");
  const fail = (msg: string): never => {
    throw new Error(`src/content/projects/${file}: ${msg}`);
  };
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    fail("filename must be a lowercase slug (letters, digits, hyphens)");
  }

  const src = fs.readFileSync(path.join(DIR, file), "utf8");
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(src);
  if (!m) fail("missing the --- frontmatter block at the top");
  const [, front, body] = m!;
  const d = (parseYaml(front) ?? {}) as Record<string, unknown>;

  const str = (key: string): string => {
    const v = d[key];
    if (typeof v === "number") return String(v);
    if (typeof v !== "string" || !v.trim()) fail(`"${key}" is required`);
    return (v as string).trim();
  };
  const optStr = (key: string): string | undefined => (d[key] == null ? undefined : str(key));
  const image = (key: string): Image | undefined => {
    const v = d[key] as Partial<Image> | undefined;
    if (v == null) return undefined;
    if (typeof v.src !== "string" || typeof v.alt !== "string") {
      fail(`"${key}" needs both src and alt`);
    }
    return { src: v.src!, alt: v.alt! };
  };

  if ("hero" in d) fail(`"hero" was renamed to "image"`);
  if (typeof d.order !== "number") fail(`"order" must be a number`);
  if (!Array.isArray(d.tools) || !d.tools.every((t) => typeof t === "string")) {
    fail(`"tools" must be a list of strings`);
  }
  const shots = (d.shots ?? []) as Project["shots"];
  if (!Array.isArray(shots)) fail(`"shots" must be a list`);
  shots.forEach((s, i) => {
    if (typeof s?.caption !== "string" || typeof s.alt !== "string") {
      fail(`shots[${i}] needs alt and caption`);
    }
  });

  // Split the body on `## ` headings into story sections.
  const [intro, ...sections] = body.split(/^## +/m);
  if (intro.trim()) fail("text before the first ## heading; every story part needs a heading");
  if (!sections.length) fail("the body needs at least one ## story section");
  const story = sections.map((s) => {
    const nl = s.indexOf("\n");
    const heading = (nl < 0 ? s : s.slice(0, nl)).trim();
    const text = nl < 0 ? "" : s.slice(nl + 1).trim();
    if (!text) fail(`story section "${heading}" is empty`);
    return { heading, html: markdown.parse(text, { async: false }) };
  });

  return {
    slug,
    order: d.order as number,
    title: str("title"),
    type: str("type"),
    year: str("year"),
    summary: str("summary"),
    role: str("role"),
    client: str("client"),
    duration: str("duration"),
    team: str("team"),
    tools: d.tools as string[],
    story,
    live: optStr("live"),
    repo: optStr("repo"),
    thumb: image("thumb"),
    image: image("image"),
    shots,
  };
}

function load(): Project[] {
  const projects = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map(parseFile)
    .sort((a, b) => a.order - b.order);
  const dup = projects.find((p, i) => i > 0 && p.order === projects[i - 1].order);
  if (dup) throw new Error(`src/content/projects: two projects share order ${dup.order}`);
  return projects;
}

// Read once per build; in dev, re-read so edits show on refresh.
let cache: ProjectView[] | undefined;

const toView = (p: Project, i: number): ProjectView => ({
  ...p,
  num: String(i + 1).padStart(2, "0"),
  href: `/work/${p.slug}/`,
  topTools: p.tools.slice(0, 3),
});

export const getProjects = (): ProjectView[] => {
  if (cache) return cache;
  const views = load().map(toView);
  if (process.env.NODE_ENV === "production") cache = views;
  return views;
};

export const getProject = (slug: string): ProjectView | undefined =>
  getProjects().find((p) => p.slug === slug);

/** The project after `slug`, wrapping around to the first. */
export const getNextProject = (slug: string): ProjectView => {
  const all = getProjects();
  const i = all.findIndex((p) => p.slug === slug);
  return all[(i + 1) % all.length];
};

/** "2019–2026" style range across all projects, for the Work section label. */
export const getYearRange = (): string => {
  const years = getProjects()
    .map((p) => Number(p.year))
    .filter(Boolean);
  const [min, max] = [Math.min(...years), Math.max(...years)];
  return min === max ? String(min) : `${min}–${max}`;
};
