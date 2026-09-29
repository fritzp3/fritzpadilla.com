import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Build-time image rendering for social previews and app icons. Satori (the
// renderer behind ImageResponse) can't read CSS variables, so colors are read
// straight from tokens.css — the design tokens stay the single source.

const root = process.cwd();

export async function readColors(): Promise<Record<string, string>> {
  const css = await readFile(join(root, "src/styles/tokens.css"), "utf8");
  const colors: Record<string, string> = {};
  for (const [, name, hex] of css.matchAll(/--color-([\w-]+):\s*(#[0-9a-fA-F]{6});/g)) {
    colors[name] = hex;
  }
  return colors;
}

export async function readFonts() {
  const [regular, semibold] = await Promise.all([
    readFile(join(root, "assets/fonts/SourceSerif4-Regular.ttf")),
    readFile(join(root, "assets/fonts/SourceSerif4-Semibold.ttf")),
  ]);
  return [
    { name: "Source Serif", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Source Serif", data: semibold, weight: 600 as const, style: "normal" as const },
  ];
}

export const ogSize = { width: 1200, height: 630 };

// The nav's register strip (see ColorBar.tsx), as token names and weights.
const BAR: [string, number][] = [
  ["text", 2],
  ["accent-800", 2],
  ["neutral-700", 1],
  ["accent-2-800", 2],
  ["accent-600", 1],
  ["neutral-800", 2],
  ["accent-700", 2],
  ["accent-500", 1],
  ["accent-900", 2],
  ["neutral-600", 1],
  ["neutral-700", 2],
  ["accent-800", 1],
  ["accent-900", 2],
  ["text", 1],
];

/** A 1200×630 card: kicker, a plate-printed headline, a footer line, the color strip. */
export async function renderCard({
  kicker,
  lines,
  footer,
}: {
  kicker: string;
  lines: string[];
  footer: string;
}) {
  const [c, fonts] = await Promise.all([readColors(), readFonts()]);
  const size = lines.join(" ").length > 28 ? 88 : 104;

  // Satori has no multiply blend, so the C/M/Y plates are drawn as offset
  // copies behind the ink — the same misregistered read at a glance.
  const plate = (color: string, dx: number, dy: number) => (
    <div
      style={{
        position: "absolute",
        left: dx,
        top: dy,
        color,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {lines.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </div>
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: c.bg,
        color: c.text,
        fontFamily: "Source Serif",
        padding: "72px 80px 0",
      }}
    >
      <div
        style={{
          fontSize: 26,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: c["neutral-700"],
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          position: "relative",
          display: "flex",
          fontSize: size,
          fontWeight: 600,
          lineHeight: 1.05,
          letterSpacing: -2,
        }}
      >
        {plate(c["process-yellow"], -3, -2)}
        {plate(c["accent-2"], 4, 3)}
        {plate(c.accent, 0, 0)}
        <div
          style={{ position: "relative", display: "flex", flexDirection: "column", color: c.text }}
        >
          {lines.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        <div style={{ fontSize: 30, color: c.text }}>{footer}</div>
        <div style={{ display: "flex", height: 18, margin: "0 -80px" }}>
          {BAR.map(([name, grow], i) => (
            <div key={i} style={{ flexGrow: grow, background: c[name] }} />
          ))}
        </div>
      </div>
    </div>,
    { ...ogSize, fonts },
  );
}

/** Square "FP" monogram with an accent underline, for favicons. */
export async function renderMonogram(px: number) {
  const [c, fonts] = await Promise.all([readColors(), readFonts()]);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: c.bg,
        color: c.text,
        fontFamily: "Source Serif",
        fontWeight: 600,
        fontSize: px * 0.56,
        lineHeight: 1,
        letterSpacing: -px * 0.02,
      }}
    >
      <span>FP</span>
      <div
        style={{
          width: px * 0.62,
          height: Math.max(2, px * 0.07),
          background: c.accent,
          marginTop: px * 0.05,
        }}
      />
    </div>,
    { width: px, height: px, fonts },
  );
}
