import { company, figures } from "@/content/facts";
import { services } from "@/content/services";

/**
 * Organization + LocalBusiness for the site, and one Service per service line. Rendered as a plain script tag
 * with `<` escaped, per the Next 16 docs; `next/script` is for executable code.
 */
export function JsonLd({
  include = ["organization", "localBusiness"] as ("organization" | "localBusiness" | "services")[],
  only,
}: {
  include?: ("organization" | "localBusiness" | "services")[];
  /** With "services": emit only this slug. */
  only?: string;
}) {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${company.siteUrl}/#organization`,
    name: company.name,
    url: company.siteUrl,
    logo: `${company.siteUrl}/brand/logo.png`,
    foundingDate: String(company.incorporated),
    email: company.email,
    telephone: company.phone,
    sameAs: Object.values(company.social),
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address.street,
      addressLocality: company.address.locality,
      addressRegion: company.address.region,
      addressCountry: company.address.country,
    },
    areaServed: ["NG", "BJ"],
    numberOfEmployees: { "@type": "QuantitativeValue", minValue: figures.staff.value },
  };
  const local = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${company.siteUrl}/#localbusiness`,
    name: company.name,
    url: company.siteUrl,
    telephone: company.phone,
    email: company.email,
    address: org.address,
    parentOrganization: { "@id": org["@id"] },
  };
  const svc = services.filter((s) => !only || s.slug === only).map((s) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.metaDescription,
    url: `${company.siteUrl}/services/${s.slug}`,
    provider: { "@id": org["@id"] },
    areaServed: ["NG", "BJ"],
  }));
  const graph = [
    ...(include.includes("organization") ? [org] : []),
    ...(include.includes("localBusiness") ? [local] : []),
    ...(include.includes("services") ? svc : []),
  ];
  return (
    <>
      {graph.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node).replace(/</g, "\u003c") }}
        />
      ))}
    </>
  );
}
