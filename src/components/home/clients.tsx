import Image from "next/image";
import { Register } from "@/components/layout/register";
import { clientLogos, logoDisplayHeight } from "@/content/clients";
import { figures } from "@/content/facts";

/**
 * Clients. A static grid of the fifteen logos, captioned with the count. No marquee: motion outside the canvas
 * only follows a user action. Sources are inconsistent in weight and resolution (Q17, blocking for launch), so
 * each is trimmed to its ink, sized by the optical rule in clients.ts, and drawn greyscale darkened to 55%
 * (multiply on paper) so a thin light wordmark cannot disappear while filled marks like MTN keep their
 * internal contrast — a flat silhouette turned those into blobs.
 */
export function Clients() {
  return (
    <Register id="clients" title="Clients" note={`${clientLogos.length} shown of ${figures.clients.display}`}>
      <ul className="grid grid-cols-3 gap-x-6 gap-y-9 sm:grid-cols-4 lg:grid-cols-5" aria-label="Client logos">
        {clientLogos.map((c) => {
          const h = logoDisplayHeight(c);
          return (
            <li key={c.file} className="flex h-12 items-center">
              <Image
                src={`/clients/trimmed/${c.file}`}
                alt={c.name}
                width={c.width}
                height={c.height}
                style={{ height: h, width: "auto" }}
                className="max-w-full object-contain object-left mix-blend-multiply [filter:grayscale(1)_brightness(0.55)_contrast(1.25)]"
              />
            </li>
          );
        })}
      </ul>
    </Register>
  );
}
