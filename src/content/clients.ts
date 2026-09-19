/**
 * The 15 client logos on the current homepage, copied local (never hot-linked — AGENTS.md) and trimmed to their
 * ink in public/clients/trimmed (scripts/trim-logos.mjs).
 * Names are read off the artwork for alt text.
 * TODO(client): Q24 — confirm all 15 are current clients with permission still in force.
 * TODO(client): Q17 — SVG or high-res versions; these are small PNGs and look soft on retina.
 */
export interface ClientLogo {
  file: string;
  name: string;
  /** Trimmed source size (scripts/trim-logos.mjs). */
  width: number;
  height: number;
}

/**
 * Optical normalisation: a compact mark and a wide wordmark cannot share one box height without one of them
 * vanishing. Display height = 52 / sqrt(aspect), clamped 26–46 px, so total ink stays comparable.
 */
export const logoDisplayHeight = (l: ClientLogo) => Math.round(Math.min(46, Math.max(26, 52 / Math.sqrt(l.width / l.height))));

export const clientLogos: ClientLogo[] = [
  { file: "brand1.png", name: "MTN", width: 144, height: 75 },
  { file: "brand2.png", name: "TECNO", width: 158, height: 36 },
  { file: "brand3.png", name: "Chi Limited", width: 106, height: 91 },
  { file: "brand4.png", name: "oraimo", width: 196, height: 44 },
  { file: "brand5.png", name: "Boomplay", width: 209, height: 48 },
  { file: "brand6.png", name: "itel", width: 130, height: 66 },
  { file: "brand7.png", name: "Infinix", width: 189, height: 46 },
  { file: "brand8.png", name: "Wasil", width: 114, height: 115 },
  { file: "brand9.png", name: "Mikano", width: 177, height: 92 },
  { file: "brand10.png", name: "CWAY", width: 182, height: 63 },
  { file: "brand11.png", name: "Ledrad", width: 166, height: 86 },
  { file: "brand12.png", name: "TGI", width: 158, height: 66 },
  { file: "brand13.png", name: "Speedaf", width: 185, height: 40 },
  { file: "brand14.png", name: "gamp", width: 141, height: 48 },
  { file: "brand15.png", name: "Transsnet", width: 145, height: 83 },
];
