// Site-wide content and settings.
// Copy marked "TODO: confirm" was carried over from the design mockup and is
// awaiting Fritz's sign-off or replacement before launch.

export const site = {
  name: "Fritz Padilla",
  url: "https://fritzpadilla.com",
  email: "hello@fritzpadilla.com",
  colophon: "Hand-built, set in Source Serif",
  description:
    "Fritz Padilla, digital impresario: producing digital experiences and leading the teams, architecture and story behind them.",
  jobTitle: "Technical Leader and Software Engineer",
  // Public profile URLs for structured data (schema.org sameAs). Leave empty
  // until the real URLs are known; placeholders would mislead search engines.
  profiles: [] as string[],
} as const;

export const settings = {
  /** Misregistered C/M/Y plates on the hero headline (false = plain text). */
  headlinePlates: true,
  /** Show the availability note in the "at a glance" strip. */
  showAvailability: true,
  /** Work section layout: numbered "index" rows or a thumbnail "grid". */
  workLayout: "index" as "index" | "grid",
  /** Show the Screenshots section on case-study pages. */
  showScreenshots: false,
  /** Show the GitHub, LinkedIn and CV links in the Contact section. */
  showContactLinks: false,
};

export const navLinks = [
  { label: "About", href: "/#about" },
  { label: "Work", href: "/#work" },
  { label: "Contact", href: "/#contact" },
] as const;

// TODO: confirm — hero copy from the mockup.
export const hero = {
  headline: ["Systems built", "for humans."],
  intro:
    "Every great product has a moment when chaos becomes clarity. Standing in the middle of the swarm. Sketching the architecture. Rallying the team. Translating between the brain and the code until everyone can see the same destination. And then the real work begins.",
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
    "I'm happiest where business goals, design and engineering meet. Translating business to technology, mentoring developers, and making sure what ships is both well built and worth using.",
  ],
  portrait: {
    src: "/images/portrait-2.jpg" as string | undefined,
    alt: "Portrait of Fritz Padilla",
  },
  // Clicking the portrait swaps it for this one, once per page load.
  codePortrait: {
    src: "/images/fritz-made-of-code.webp",
    alt: "Portrait of Fritz Padilla made of lines of code",
    label: "Reveal the code behind the portrait",
  },
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
    { label: "GitHub", href: "https://github.com/fritzp3" }, // TODO: profile URL
    { label: "LinkedIn", href: "https://www.linkedin.com/in/fritz-padilla-iii/" }, // TODO: profile URL
    { label: "Download CV", href: "/cv.pdf" }, // TODO: add public/cv.pdf
  ],
};
