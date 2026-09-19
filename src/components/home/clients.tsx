import Image from "next/image";
import { Register } from "@/components/layout/register";
import { clientLogos } from "@/content/clients";
import { figures } from "@/content/facts";

/**
 * Clients. A static grid of the fifteen logos, captioned with the count. No marquee: motion outside the canvas
 * only follows a user action. Logos are the current site's small PNGs until Q17 supplies better ones.
 */
export function Clients() {
  return (
    <Register id="clients" title="Clients" note={`${clientLogos.length} shown of ${figures.clients.display}`}>
      <ul className="grid grid-cols-3 gap-x-6 gap-y-8 sm:grid-cols-4 lg:grid-cols-5" aria-label="Client logos">
        {clientLogos.map((c) => (
          <li key={c.file} className="flex h-12 items-center">
            <Image
              src={`/clients/${c.file}`}
              alt={c.name}
              width={160}
              height={64}
              className="h-10 w-auto max-w-full object-contain object-left grayscale mix-blend-multiply"
            />
          </li>
        ))}
      </ul>
    </Register>
  );
}
