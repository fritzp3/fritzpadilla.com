import { projects, type Project } from "@/content/projects";

export type ProjectView = Project & { num: string; href: string; topTools: string[] };

const toView = (p: Project, i: number): ProjectView => ({
  ...p,
  num: String(i + 1).padStart(2, "0"),
  href: `/work/${p.slug}/`,
  topTools: p.tools.slice(0, 3),
});

export const getProjects = (): ProjectView[] => projects.map(toView);

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
  const years = projects.map((p) => Number(p.year)).filter(Boolean);
  const [min, max] = [Math.min(...years), Math.max(...years)];
  return min === max ? String(min) : `${min}–${max}`;
};
