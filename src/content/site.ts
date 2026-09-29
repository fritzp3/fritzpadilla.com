// Site-wide content and settings. Real values are supplied by Fritz; anything
// marked TODO is a placeholder that must be replaced before launch.

export const site = {
  name: "Fritz Padilla",
  url: "https://fritzpadilla.com",
  // TODO: confirm the public contact address (taken from the mockup).
  email: "hello@fritzpadilla.com",
  // Footer colophon, from the mockup.
  colophon: "Hand-built, set in Source Serif",
} as const;

export const navLinks = [
  { label: "About", href: "/#about" },
  { label: "Work", href: "/#work" },
  { label: "Contact", href: "/#contact" },
] as const;
