// The multi-color register strip along the bottom of the nav, from the
// mockup: fourteen segments of ink, accent and neutral steps at 1–2 weights.
const SEGMENTS: [string, number][] = [
  ["bg-ink", 2],
  ["bg-accent-800", 2],
  ["bg-neutral-700", 1],
  ["bg-accent-2-800", 2],
  ["bg-accent-600", 1],
  ["bg-neutral-800", 2],
  ["bg-accent-700", 2],
  ["bg-accent-500", 1],
  ["bg-accent-900", 2],
  ["bg-neutral-600", 1],
  ["bg-neutral-700", 2],
  ["bg-accent-800", 1],
  ["bg-accent-900", 2],
  ["bg-ink", 1],
];

export default function ColorBar({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none flex h-2.5 ${className}`}>
      {SEGMENTS.map(([color, grow], i) => (
        <span key={i} className={color} style={{ flexGrow: grow }} />
      ))}
    </div>
  );
}
