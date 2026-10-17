# Placeholder imagery — presentations only

The site's photo frames are reserved for TDL's own photography (`docs/CLIENT-QUESTIONS.md` Q18, Q26, Q27) and stay visibly empty until it arrives. For client presentations, `PLACEHOLDER_IMAGES=true` fills the frames listed below with licensed stock (label and credit on every one) and the named-person frames with initials monograms.

## It cannot ship by accident

- Default is off. `PLACEHOLDER_IMAGES` is unset or `false` in every environment unless someone sets it for a demo.
- `next.config.ts` applies one rule everywhere — locally, on a Vercel preview, on a Vercel production deployment: with `PLACEHOLDER_IMAGES` on, a **production target** (`NODE_ENV=production` and `VERCEL_ENV` not `preview`) builds only if `PLACEHOLDER_PRESENTATION_BUILD` is also set; otherwise the build **fails** and the error prints every value it saw (`PLACEHOLDER_IMAGES`, `PLACEHOLDER_PRESENTATION_BUILD`, `NODE_ENV`, `VERCEL_ENV`, `VERCEL`). A Vercel **preview** needs only `PLACEHOLDER_IMAGES` — previews run with `NODE_ENV=production`, and `VERCEL_ENV=preview` is what tells them apart from the live deployment. Both variables are read the same way (trimmed, quotes stripped, case-insensitive; `true`/`1`/`yes`/`on`).
- When a production target does build with both set, the build log carries `[placeholder guard] Presentation build … Remove … before launch`. **Before launch, remove both variables from the Vercel Production environment.** That is a checklist item, not a guard.
- Flag off, the frames return to the reserved state: a compact bordered note ("Photograph to come", the place, the format), not an empty box at the photograph's size. Nothing else changes.
- `PRESENTATION_HIDE_EMPTY_FRAMES=true` (any environment) leaves the reserved notes and the empty portrait frames out altogether, along with sections that held nothing else, so a page can be shown as it will read once the photography exists. Placeholders and monograms are unaffected. It hides rather than shows, so a production build only warns; remove it before launch with the other two (HANDOFF.md).

## Never a face

The three testimonial portrait frames (Chidi Okonkwo, Mr. Michael Kehinde, Dorothy Akpati) and, on `/about-us`, the leadership and board frames never show a stock or generated face: a face under a real named person manufactures a likeness. With the flag on they show an **initials monogram** (CO, MK, DA) in Archivo Expanded, `--signal` on `--ink`, sized to the frame (`src/components/ui/monogram.tsx`). Flag off, they read "Portrait to come". The real-headshot ask stays open in `docs/CLIENT-QUESTIONS.md` Q26 / Q18.

## Registry (`src/content/placeholders.ts`)

Five photographs. Pexels and Unsplash licences (free to use; attribution given anyway, on the image and here). Files in `public/placeholders/`, 1,600 px wide. Three were cropped to remove a device maker's logo; nothing else was altered.

| Key | Frames | Scene | Photographer | Source |
|---|---|---|---|---|
| `desk-work` | `/about-us` → "At work" beside the empty Coker Road frame (3:2); `/careers` → header, no caption (3:2) | A woman standing at a desk reviewing charts on a laptop, Abuja office, natural light, back to camera, no visible branding | [Taiye Salawu](https://www.pexels.com/@taiyesalawu/) | [pexels.com/photo/36482981](https://www.pexels.com/photo/professional-woman-analyzing-data-on-laptop-36482981/) |
| `interview` | Home slider | Two people in conversation across a desk, Lagos office | [Ninthgrid](https://www.pexels.com/@ninthgrid-2149521550/) | [pexels.com/photo/30688591](https://www.pexels.com/photo/professional-interview-in-modern-lagos-office-30688591/) |
| `files-desk` | Home slider | A man working through files at a desk lined with folders, Osun State. **Cropped** to the left 83% (a monitor's maker's logo) | [Oluwapamilerinayo Ajala](https://www.pexels.com/@oluwapamilerinayo-ajala-1663970972/) | [pexels.com/photo/30970394](https://www.pexels.com/photo/professional-in-busy-office-environment-30970394/) |
| `laptop-pair` | Home slider | A woman and a man working through a problem at a laptop, open-plan workspace, Lagos (NESA by Makers) | [@disruptxn](https://unsplash.com/@disruptxn) (the profile's display name is "X") | [unsplash.com/photos/kwzWjTnDPLk](https://unsplash.com/photos/man-using-black-laptop-computer-kwzWjTnDPLk) |
| `laptop-work` | Home slider | A man in a waistcoat working at a laptop, Lagos office. **Cropped** to 9–89% of the width (a monitor's and the laptop's makers' logos). Fluorescent light with a cool cast — the weakest of the five | [Oladipupo Ajisegiri](https://www.pexels.com/@ladiwayne/) | [pexels.com/photo/1405769](https://www.pexels.com/photo/man-sitting-on-chair-indoor-1405769/) |

Faces are fine in the slider: it names no one and claims no premises, and its caption says the people are not TDL's staff. The face rule is about frames carrying a named person; the premises rule is about frames captioned with TDL's address.

### What each route shows with the flag on

| Route | Fills | Stays empty |
|---|---|---|
| `/` | The slider after the proof bar (four images — `desk-work` is portrait and dropped out at 21:9 — one caption line: "Stand-in photographs. TDL's own to come." — no per-image badge or credit since 2026-10-17; credits are here); three testimonial portraits → monograms CO, MK, DA | — (flag off, the slider is a "Photographs to come" note naming the address) |
| `/about-us` | "At work" frame (`desk-work`); two leadership and three board portraits → monograms | "The office" frame captioned 69 Coker Road |
| `/careers` | Header frame (`desk-work`), no caption | — |
| `/contact-us` | — (the brochure QR code is marked "Demo build … Do not print it") | — |
| `/work`, `/services/*`, `/certifications`, legal, `/insights` | nothing (no frames) | — |

### Sourced and rejected (2026-10-17, for the home slider)

Criteria: Nigerian workplace with the location stated on the source page, real people mid-work, natural light where possible, no legible brand logo, no legible document, licensed for commercial use.

- **Device logos that no crop removes** (Apple, HP, Lenovo, Samsung): Ninthgrid's Lagos sets 30677713, 30677717, 30677719, 30689114, 30690402, 30689108, 30677710, 30688915, 30678873, 30688907, 30688909, 30678212, 30677589, 30689320; the Ninthgrid meeting 30688592 / 30677714 / 30688596 (two logos mid-table); 33672077; 18287137; 26946434; Unsplash 5WOySQOZ2t4 and 9ewfCZmObeM; Yomi Solomon 20719271 (Lenovo on the foreground monitor — and no location stated).
- **A brand or slogan on clothing**: 33176067 (company shirt), 33107901 (campaign vests), 17226661 (a large brand print on a sweatshirt — chosen first, then dropped), Unsplash Lw7Mv1JvPo0 and E2vYTaz-JvY.
- **Signage or legible paper**: 30688593 (café signage), 38649010 (Kaduna; a legible poster and papers), 18287139 (a handwritten note with a name), 39577820 (Ghana, and signage).
- **Not a Nigerian workplace, or not stated**: 7658285 (Belarus), 12911261 (no location), 3869650 (no location), 37198883 (hard hats with logos, construction site).
- **Posed, not at work**: 34690060, 30689321, Unsplash Xq-RY9z8VY4; 29640442 (papers, not clearly a workplace).
- **Same people twice**: Unsplash IgUR1iX0mqM is the same two people and session as `laptop-pair`; one of the pair was enough.

### Sourced and rejected (2026-09-19, for the first frames)

- For the Coker Road frame: an Abuja office block, a Lagos railway-station entrance, the Bank of Industry HQ — each would have sat under the caption naming TDL's address. That frame stays empty in every mode.
- A Zaria greenhouse and a Jimeta construction site: real, mid-work, but they say TDL staffs farms and building sites, and the buyer is a country manager at an FMCG or consumer-electronics company. Down-market for the brand.
- "Two women reviewing documents" (Emmanuel Pius, 37568245): the warmest office image found, but at full size the desk holds a legible customer file with a name and an ID photo, plus a bank's product banner and uniform logos. Every crop that keeps the hands keeps the file. A firm that sells data-protection advice cannot show someone's file, placeholder or not.
- Every Ninthgrid group shot: Apple logos front and centre, or smiling at the camera.
- Free Nigerian factory, logistics or warehouse floors with people mid-work do not exist on Pexels or Unsplash; every "nigeria factory" result was another country.

## Running a presentation build

```
PLACEHOLDER_IMAGES=true PLACEHOLDER_PRESENTATION_BUILD=1 npm run build && npm start
```

or, on Vercel: set `PLACEHOLDER_IMAGES=true` on the **Preview** environment (nothing else needed), or on Production set both `PLACEHOLDER_IMAGES=true` and `PLACEHOLDER_PRESENTATION_BUILD=1` for the presentation and remove both afterwards.

## Removing the mechanism for good

Delete `src/content/placeholders.ts`, `src/components/ui/monogram.tsx`, the `monograms` prop on `Testimonials`, the guard block in `next.config.ts`, the placeholder branch in `src/components/home/office.tsx` and `homePlaceholderSlides` in `src/content/photographs.ts`, and this file. Nothing else references them.
