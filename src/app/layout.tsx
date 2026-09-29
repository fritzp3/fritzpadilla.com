import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PressDriver from "@/components/PressDriver";
import PrintPlates from "@/components/PrintPlates";
import { site } from "@/content/site";
import "@/styles/globals.css";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s — ${site.name}` },
  description: `Portfolio of ${site.name}.`,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={sourceSerif.variable}>
      <body>
        <a
          href="#main"
          className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60]"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" className="mx-auto max-w-[1200px] px-(--gutter)">
          {children}
        </main>
        <Footer />
        <PrintPlates />
        <PressDriver />
      </body>
    </html>
  );
}
