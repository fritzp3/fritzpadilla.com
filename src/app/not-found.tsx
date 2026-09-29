import Link from "next/link";

// Exported as /404.html; CloudFront serves it for any missing path.
export default function NotFound() {
  return (
    <section className="py-[clamp(64px,12vw,160px)]">
      <p className="mb-4 text-[13px] tracking-[0.08em] text-ink/70 uppercase">Error 404</p>
      <h1 className="m-0 max-w-[18ch] text-[clamp(38px,5.6vw,72px)] leading-[1.08] tracking-[-0.02em]">
        This page isn’t in print.
      </h1>
      <p className="mt-6 mb-0 max-w-[52ch] text-[19px] leading-[1.6]">
        The link may be old or mistyped. Try the home page or the selected work.
      </p>
      <div className="mt-8 flex flex-wrap gap-(--space-3)">
        <Link href="/" className="btn btn-primary">
          Home
        </Link>
        <Link href="/#work" className="btn btn-ghost">
          Selected work
        </Link>
      </div>
    </section>
  );
}
