import type { Metadata } from "next";
import PlateHeadline from "@/components/PlateHeadline";

// Temporary check page for the design foundation. Remove before launch
// (see PLAN.md, Phase 8).
export const metadata: Metadata = { title: "Specimen", robots: { index: false } };

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-14 mb-4 block text-[13px] tracking-[0.08em] text-ink/70 uppercase">
      {children}
    </span>
  );
}

export default function Specimen() {
  return (
    <main className="mx-auto max-w-[1200px] px-[clamp(20px,5vw,72px)] pt-12 pb-24">
      <Label>Plate headline (move the mouse and the plates lean)</Label>
      <PlateHeadline
        lines={["Websites built", "to be read."]}
        className="m-0 text-[clamp(42px,6.4vw,84px)] leading-[1.08] tracking-[-0.02em]"
      />

      <Label>Type scale</Label>
      <h1>Heading one</h1>
      <h2>Heading two</h2>
      <h3>Heading three</h3>
      <h4>Heading four</h4>
      <p className="max-w-[58ch] text-[17px] leading-[1.65]">
        Body copy in Source Serif 4. <em>Italic for captions and emphasis.</em>{" "}
        <a href="#">An inline link</a>.
      </p>

      <Label>Buttons</Label>
      <div className="flex flex-wrap gap-3">
        <a href="#" className="btn btn-primary">
          Primary
        </a>
        <a href="#" className="btn btn-secondary">
          Secondary
        </a>
        <a href="#" className="btn btn-ghost">
          Ghost
        </a>
      </div>

      <Label>Tags</Label>
      <div className="flex flex-wrap gap-2">
        <span className="tag tag-outline">Next.js</span>
        <span className="tag tag-accent">TypeScript</span>
        <span className="tag tag-accent-2">Accent 2</span>
        <span className="tag tag-neutral">Neutral</span>
      </div>

      <Label>Theme colors as Tailwind utilities</Label>
      <div className="flex flex-wrap gap-2">
        {[
          "bg-accent",
          "bg-accent-2",
          "bg-process-yellow",
          "bg-ink",
          "bg-surface",
          "bg-neutral-500",
        ].map((c) => (
          <div
            key={c}
            className={`${c} h-12 w-24 rounded-md border border-divider shadow-sm`}
            title={c}
          />
        ))}
      </div>

      <Label>Four-plate separation (hover to register)</Label>
      <figure className="cmyk max-w-[560px]">
        <div className="print aspect-[16/10]">
          <div className="size-full bg-linear-135 from-process-yellow via-accent-2-600 to-accent-900" />
        </div>
      </figure>

      <Label>Halftone</Label>
      <figure className="halftone aspect-[16/10] max-w-[560px]">
        <div className="size-full bg-linear-to-r from-neutral-600 to-neutral-300" />
      </figure>
    </main>
  );
}
