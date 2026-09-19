import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import localFont from "next/font/local";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { RosterProvider } from "@/components/roster/roster-context";
import { company } from "@/content/facts";
import "./globals.css";

/**
 * One family. Archivo variable (wght only, width 100) for everything, plus one static Archivo Expanded 700
 * instance for display, both self-hosted and preloaded by next/font. Measured 2026-09-18: 31.8 + 14.5 KB latin.
 * The full wdth axis would be 84.2 KB. Inlining the display face as a data URI was tried and measured worse
 * (FCP +0.3 s on simulated 4G, LCP unchanged) — see DESIGN-DECISIONS.md, milestone 4.
 */
const archivo = Archivo({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-archivo",
  display: "swap",
});

const archivoExpanded = localFont({
  src: "./fonts/archivo-expanded-700-latin.woff2",
  weight: "700",
  style: "normal",
  variable: "--font-archivo-expanded",
  display: "swap",
  adjustFontFallback: "Arial",
});


export const metadata: Metadata = {
  metadataBase: new URL(company.siteUrl),
  title: {
    default: "Total Data Limited — HR and business process outsourcing, Nigeria and Benin Republic",
    template: "%s — Total Data Limited",
  },
  description: company.description,
  openGraph: {
    siteName: company.name,
    locale: "en_NG",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${archivoExpanded.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <RosterProvider>
          <Header />
          {children}
        </RosterProvider>
        <Footer />
      </body>
    </html>
  );
}

