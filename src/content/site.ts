// Site-wide content and settings.
// Copy marked "TODO: confirm" was carried over from the design mockup and is
// awaiting Fritz's sign-off or replacement before launch.

export const site = {
  name: "Fritz Padilla",
  url: "https://fritzpadilla.com",
  // TODO: confirm the public contact address.
  email: "hello@fritzpadilla.com",
  colophon: "Hand-built, set in Source Serif",
} as const;

export const settings = {
  /** Misregistered C/M/Y plates on the hero headline (false = plain text). */
  headlinePlates: true,
  /** Show the availability note in the "at a glance" strip. */
  showAvailability: true,
  /** Work section layout: numbered "index" rows or a thumbnail "grid". */
  workLayout: "index" as "index" | "grid",
};

export const navLinks = [
  { label: "About", href: "/#about" },
  { label: "Work", href: "/#work" },
  { label: "Contact", href: "/#contact" },
] as const;

// TODO: confirm — hero copy from the mockup.
export const hero = {
  headline: ["Websites built", "to be read."],
  intro:
    "I’m Fritz, a digital impresario. I produce digital experiences and put them in front of people — from the Flash era through HTML5 to the platforms and backends behind today’s web — leading the teams, the architecture and the story from first idea to opening night.",
};

// TODO: confirm — every fact in the "at a glance" strip.
export const glance = {
  items: ["Based in Lisbon", "9 years shipping", "Digital Impresario"],
  availability: "Available from November 2026",
};

// TODO: confirm — About copy and skills from the mockup.
export const about = {
  heading: "I lead the people and the platforms behind great digital experiences.",
  paragraphs: [
    "I started out hand-coding websites and grew into leading the teams that build them. Today I own digital experiences end to end: shaping technical strategy with stakeholders, choosing architecture that will last, guiding designers and engineers through delivery, and holding the line on performance, accessibility and quality.",
    "I’m happiest where business goals, design and engineering meet — translating between them, mentoring developers, and making sure what ships is both well built and worth using.",
  ],
  // TODO: add the portrait at public/images/portrait.webp (4:5) and set src.
  portrait: { src: undefined as string | undefined, alt: "Portrait of Fritz Padilla" },
  skills: [
    { area: "Leadership", detail: "Team leadership, mentoring, delivery" },
    { area: "Strategy", detail: "Technical roadmaps, stakeholder alignment" },
    { area: "Architecture", detail: "Headless CMS, composable platforms, cloud" },
    { area: "Engineering", detail: "React, Next.js, TypeScript, Node" },
    { area: "Experience", detail: "Design systems, accessibility, performance" },
  ],
};

// TODO: confirm — contact copy; add real profile URLs and public/cv.pdf.
export const contact = {
  heading: "Have something that needs building?",
  body: "Tell me about the project, the timeline and who’s involved. I reply within two working days.",
  links: [
    { label: "GitHub", href: "https://github.com/" }, // TODO: profile URL
    { label: "LinkedIn", href: "https://www.linkedin.com/" }, // TODO: profile URL
    { label: "Download CV", href: "/cv.pdf" }, // TODO: add public/cv.pdf
  ],
};
