import QRCode from "qrcode";
import { brochureQrTarget, brochureReady } from "@/lib/brochure";

/**
 * The brochure QR code, drawn as SVG when the page is prerendered. A server component: the `qrcode` package runs
 * at build time and the browser gets markup only, no script. Navy modules on paper, error correction M, the
 * standard four-module quiet zone.
 */
export async function BrochureQr() {
  const { url, demo } = brochureQrTarget();
  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 4,
    color: { dark: "#0F1B2D", light: "#FAFAF8" },
  });
  const what = brochureReady ? "our brochure (PDF)" : "our services";
  return (
    <div className="flex flex-wrap items-start gap-5">
      <div
        role="img"
        aria-label={`QR code for ${url}`}
        className="h-36 w-36 shrink-0 border border-olive [&>svg]:h-full [&>svg]:w-full"
        // Generated from a fixed string at build time; no user input reaches it.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="min-w-0">
        <p>Scan with a phone camera to open {what}.</p>
        <p className="mt-1.5">
          <a href="/brochure" className="text-signal-deep underline underline-offset-4">
            Open {what}
          </a>
        </p>
        {demo ? (
          <p className="data mt-3 max-w-[30ch] bg-ink px-2.5 py-1.5 text-paper">
            Demo build: this code points at the demo site. Do not print it.
          </p>
        ) : null}
      </div>
    </div>
  );
}
