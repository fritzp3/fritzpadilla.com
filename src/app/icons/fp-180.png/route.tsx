import { renderMonogram } from "@/lib/og";

// The Apple touch icon, exported as out/icons/fp-180.png (linked from the layout's metadata).
export const dynamic = "force-static";

export function GET() {
  return renderMonogram(180);
}
