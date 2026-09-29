import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import PrintPlates from "@/components/PrintPlates";
import PressDriver from "@/components/PressDriver";
import "@/styles/globals.css";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fritzpadilla.com"),
  title: { default: "Fritz Padilla", template: "%s — Fritz Padilla" },
  description: "Portfolio of Fritz Padilla.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={sourceSerif.variable}>
      <body>
        {children}
        <PrintPlates />
        <PressDriver />
      </body>
    </html>
  );
}
