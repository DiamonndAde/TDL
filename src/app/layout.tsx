import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@/components/layout/analytics";
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
    default: "Total Data Limited — We run the HR. You run the business.",
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
    // No `h-full` on <html>: Lenis measures the document with a ResizeObserver on documentElement, and a
    // viewport-pinned html box never reports growth, which trapped scrolling after client-side navigation.
    <html lang="en" className={`${archivo.variable} ${archivoExpanded.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        {/* Consent banner and the SDK starter, as one lazy chunk. Early in the DOM so Tab reaches the choice
            right after the skip link; painted at the bottom of the viewport. Nothing at all without a key. */}
        <Analytics />
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

