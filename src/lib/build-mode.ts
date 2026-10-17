import { placeholdersEnabled } from "@/content/placeholders";

/**
 * A demo build: one prepared for showing the site to TDL, as opposed to the live site.
 *
 * It is the same switch as presentation imagery (`PLACEHOLDER_IMAGES`) rather than a new one, on purpose. That
 * switch is already guarded — `next.config.ts` refuses a production build with it unless the presentation marker
 * is also set — and already sits first on the launch checklist for removal. One flag that means "this is a
 * demo" is one flag to remove; a second would be a second thing to forget.
 *
 * Server-only: `PLACEHOLDER_IMAGES` is not a `NEXT_PUBLIC_` variable, so it is read at build or prerender time
 * in server components, and anything a client component needs from it is passed down as a prop.
 *
 * What a demo build changes, and nothing else:
 *  - placeholder photographs fill the home slider (src/content/placeholders.ts)
 *  - the brochure QR on /contact-us encodes the demo deployment's own address, so it can be scanned in the room
 */
export const isDemoBuild = placeholdersEnabled;
