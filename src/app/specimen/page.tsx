import type { Metadata } from "next";

// Temporary Phase 1 check page: design foundation specimen.
// Remove before launch (see PLAN.md, Phase 8).
export const metadata: Metadata = { title: "Specimen", robots: { index: false } };

const label: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "color-mix(in srgb, var(--color-text) 70%, transparent)",
  margin: "56px 0 16px",
};

const Plates = ({ text }: { text: string }) => (
  <span className="cmyk-head" style={{ display: "block" }}>
    <span className="paper">{text}</span>
    <span className="plate plate-c" aria-hidden="true">
      {text}
    </span>
    <span className="plate plate-m" aria-hidden="true">
      {text}
    </span>
    <span className="plate plate-y" aria-hidden="true">
      {text}
    </span>
  </span>
);

export default function Specimen() {
  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px clamp(20px, 5vw, 72px) 96px" }}>
      <span style={label}>Plate headline (move the mouse — plates lean)</span>
      <h1
        style={{
          fontSize: "clamp(42px, 6.4vw, 84px)",
          lineHeight: 1.08,
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        <Plates text="Websites built" />
        <Plates text="to be read." />
      </h1>

      <span style={label}>Type scale</span>
      <h1>Heading one</h1>
      <h2>Heading two</h2>
      <h3>Heading three</h3>
      <h4>Heading four</h4>
      <p style={{ fontSize: 17, lineHeight: 1.65, maxWidth: "58ch" }}>
        Body copy in Source Serif 4. <em>Italic for captions and emphasis.</em>{" "}
        <a href="#">An inline link</a>.
      </p>

      <span style={label}>Buttons</span>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href="#" className="btn btn-primary" style={{ color: "var(--color-bg)" }}>
          Primary
        </a>
        <a href="#" className="btn btn-secondary">
          Secondary
        </a>
        <a href="#" className="btn btn-ghost">
          Ghost
        </a>
      </div>

      <span style={label}>Tags</span>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span className="tag tag-outline">Next.js</span>
        <span className="tag tag-accent">TypeScript</span>
        <span className="tag tag-accent-2">Accent 2</span>
        <span className="tag tag-neutral">Neutral</span>
      </div>

      <span style={label}>Four-plate separation (hover to register)</span>
      <figure className="cmyk" style={{ overflow: "visible", maxWidth: 560 }}>
        <div className="print" style={{ aspectRatio: "16 / 10" }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(135deg, #e8b04b 0%, #c2553b 35%, #3f6e8c 70%, #1d2b33 100%)",
            }}
          />
        </div>
      </figure>

      <span style={label}>Halftone</span>
      <figure className="halftone" style={{ maxWidth: 560, aspectRatio: "16 / 10" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, #7d7979, #d7d3d3)",
          }}
        />
      </figure>
    </main>
  );
}
