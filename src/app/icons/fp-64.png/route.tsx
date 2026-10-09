import { renderMonogram } from "@/lib/og";

// The favicon, exported as out/icons/fp-64.png (linked from the layout's metadata).
export const dynamic = "force-static";

export function GET() {
  return renderMonogram(64);
}
