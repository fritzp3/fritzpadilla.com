import { site } from "@/content/site";

export default function Footer() {
  // Rendered at build time, so the year updates on each deploy.
  const year = new Date().getFullYear();
  return (
    <footer className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-x-6 gap-y-2 px-(--gutter) pt-8 pb-12 text-[13px] text-ink/70">
      <span>
        © {year} {site.name}
      </span>
      <span>{site.colophon}</span>
    </footer>
  );
}
