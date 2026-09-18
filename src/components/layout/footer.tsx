import Link from "next/link";
import { company } from "@/content/facts";
import { services } from "@/content/services";
import { Container } from "./container";
import { Logo } from "./logo";

/**
 * Careers gets its entry point here and in the nav, not the home page's last scroll position (brief §8.9).
 * Insights stays out until there is content (Q13). Copyright year is generated (Q3).
 */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="on-ink bg-ink text-paper">
      <Container className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <address className="mt-6 text-[15px] not-italic leading-relaxed text-ink-light">
            {company.address.street}, {company.address.locality}, {company.address.region}
            <br />
            <a href={company.phoneHref} className="text-paper underline-offset-4 hover:underline">
              {company.phone}
            </a>
            <br />
            <a href={`mailto:${company.email}`} className="text-paper underline-offset-4 hover:underline">
              {company.email}
            </a>
          </address>
          <p className="data mt-6 max-w-[34rem] text-ink-light">
            Personal data you give us is collected with your consent and processed under the {company.ndpr}. This is
            an abridged notice; the full policy is at{" "}
            <Link href="/privacy-policy" className="text-paper underline-offset-4 hover:underline">
              /privacy-policy
            </Link>
            .
          </p>
        </div>

        <FooterList title="Services" items={services.map((s) => ({ href: `/services/${s.slug}`, label: s.name }))} />
        <FooterList
          title="Company"
          items={[
            { href: "/about-us", label: "About" },
            { href: "/work", label: "Work" },
            { href: "/careers", label: "Careers" },
            { href: "/certifications", label: "Certifications" },
            { href: "/contact-us", label: "Contact" },
          ]}
        />
        <FooterList
          title="Elsewhere"
          items={[
            { href: company.social.linkedin, label: "LinkedIn", external: true },
            { href: company.social.instagram, label: "Instagram", external: true },
            { href: company.social.x, label: "X", external: true },
            // TODO(client): Q4 — labelled Facebook because that is where it goes.
            { href: company.social.facebook, label: "Facebook", external: true },
          ]}
        />
      </Container>
      <Container className="flex flex-col gap-2 border-t border-ink-light/40 py-5 text-ink-light md:flex-row md:justify-between">
        <p className="data">
          © {year} {company.legalName}. {company.iso} certified.
        </p>
        <p className="data flex gap-5">
          <Link href="/privacy-policy" className="underline-offset-4 hover:underline">
            Privacy
          </Link>
          <Link href="/cookies-policy" className="underline-offset-4 hover:underline">
            Cookies
          </Link>
        </p>
      </Container>
    </footer>
  );
}

function FooterList({
  title,
  items,
}: {
  title: string;
  items: { href: string; label: string; external?: boolean }[];
}) {
  return (
    <nav aria-label={title}>
      <h2 className="text-[15px] font-medium">{title}</h2>
      <ul className="mt-4 flex flex-col gap-2.5 text-[15px] text-ink-light">
        {items.map((i) => (
          <li key={i.href}>
            {i.external ? (
              <a
                href={i.href}
                rel="noopener"
                target="_blank"
                className="underline-offset-4 hover:text-paper hover:underline"
              >
                {i.label}
              </a>
            ) : (
              <Link href={i.href} className="underline-offset-4 hover:text-paper hover:underline">
                {i.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
