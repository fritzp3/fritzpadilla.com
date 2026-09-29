import Link from "next/link";
import ColorBar from "@/components/ColorBar";
import { navLinks, site } from "@/content/site";

// Sticky site header. Desktop: name left, links centered, CTA right — the
// mockup's layout. Below `sm`, two rows: name + CTA, then the links, so
// nothing is orphaned and nothing overlaps the page.
export default function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-bg">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-3 gap-y-2 px-(--gutter) py-[15px] sm:gap-x-(--space-4)"
      >
        <Link
          href="/"
          className="mr-auto font-heading text-[clamp(22px,7vw,28px)] font-semibold tracking-[-0.01em] whitespace-nowrap text-ink no-underline hover:text-ink"
        >
          {site.name}
        </Link>
        <ul className="order-last m-0 flex w-full list-none gap-(--space-4) p-0 sm:order-none sm:w-auto">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-[17px] whitespace-nowrap text-ink no-underline hover:text-accent"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <a href={`mailto:${site.email}`} className="btn btn-primary ml-auto shrink-0">
          Get in touch
        </a>
      </nav>
      <ColorBar className="absolute inset-x-0 bottom-0" />
    </header>
  );
}
