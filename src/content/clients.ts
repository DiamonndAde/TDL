/**
 * The 15 client logos on the current homepage, copied local (never hot-linked — AGENTS.md).
 * Names are read off the artwork for alt text.
 * TODO(client): Q24 — confirm all 15 are current clients with permission still in force.
 * TODO(client): Q17 — SVG or high-res versions; these are small PNGs and look soft on retina.
 */
export interface ClientLogo {
  file: string;
  name: string;
}

export const clientLogos: ClientLogo[] = [
  { file: "brand1.png", name: "MTN" },
  { file: "brand2.png", name: "TECNO" },
  { file: "brand3.png", name: "Chi Limited" },
  { file: "brand4.png", name: "oraimo" },
  { file: "brand5.png", name: "Boomplay" },
  { file: "brand6.png", name: "itel" },
  { file: "brand7.png", name: "Infinix" },
  { file: "brand8.png", name: "Wasil" },
  { file: "brand9.png", name: "Mikano" },
  { file: "brand10.png", name: "CWAY" },
  { file: "brand11.png", name: "Ledrad" },
  { file: "brand12.png", name: "TGI" },
  { file: "brand13.png", name: "Speedaf" },
  { file: "brand14.png", name: "gamp" },
  { file: "brand15.png", name: "Transsnet" },
];
