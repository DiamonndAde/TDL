# Placeholder imagery — presentations only

The site's photo frames are reserved for TDL's own photography (`docs/CLIENT-QUESTIONS.md` Q18, Q26, Q27) and stay visibly empty until it arrives. For client presentations, `PLACEHOLDER_IMAGES=true` fills the frames listed below with licensed stock (label and credit on every one) and the named-person frames with initials monograms.

## It cannot ship by accident

- Default is off. `PLACEHOLDER_IMAGES` is unset or `false` in every environment unless someone sets it for a demo.
- `next.config.ts` applies one rule everywhere — locally, on a Vercel preview, on a Vercel production deployment: with `PLACEHOLDER_IMAGES` on, a **production target** (`NODE_ENV=production` and `VERCEL_ENV` not `preview`) builds only if `PLACEHOLDER_PRESENTATION_BUILD` is also set; otherwise the build **fails** and the error prints every value it saw (`PLACEHOLDER_IMAGES`, `PLACEHOLDER_PRESENTATION_BUILD`, `NODE_ENV`, `VERCEL_ENV`, `VERCEL`). A Vercel **preview** needs only `PLACEHOLDER_IMAGES` — previews run with `NODE_ENV=production`, and `VERCEL_ENV=preview` is what tells them apart from the live deployment. Both variables are read the same way (trimmed, quotes stripped, case-insensitive; `true`/`1`/`yes`/`on`).
- When a production target does build with both set, the build log carries `[placeholder guard] Presentation build … Remove … before launch`. **Before launch, remove both variables from the Vercel Production environment.** That is a checklist item, not a guard.
- Flag off, the frames return to the empty reserved state. Nothing else changes.

## Never a face

The three testimonial portrait frames (Chidi Okonkwo, Mr. Michael Kehinde, Dorothy Akpati) and, on `/about-us`, the leadership and board frames never show a stock or generated face: a face under a real named person manufactures a likeness. With the flag on they show an **initials monogram** (CO, MK, DA) in Archivo Expanded, `--signal` on `--ink`, sized to the frame (`src/components/ui/monogram.tsx`). Flag off, they read "Portrait to come". The real-headshot ask stays open in `docs/CLIENT-QUESTIONS.md` Q26 / Q18.

## Registry (`src/content/placeholders.ts`)

One photograph, used in three frames with different crops. Pexels licence (free to use; attribution given anyway). File in `public/placeholders/`, 1,600 px wide.

| Key | Frames | Scene | Photographer | Source |
|---|---|---|---|---|
| `desk-work` | Home → Work section (3:2); `/about-us` → "At work" beside the empty Coker Road frame (3:2); `/careers` → header, no caption (3:2) | A woman standing at a desk reviewing charts on a laptop, Abuja office, natural light, back to camera, no visible branding | [Taiye Salawu](https://www.pexels.com/@taiyesalawu/) | [pexels.com/photo/36482981](https://www.pexels.com/photo/professional-woman-analyzing-data-on-laptop-36482981/) |

### What each route shows with the flag on

| Route | Fills | Stays empty |
|---|---|---|
| `/` | Work-section frame (`desk-work`); three testimonial portraits → monograms CO, MK, DA | "The office" frame captioned 69 Coker Road |
| `/about-us` | "At work" frame (`desk-work`); two leadership and three board portraits → monograms | "The office" frame captioned 69 Coker Road |
| `/careers` | Header frame (`desk-work`), no caption | — |
| `/work`, `/services/*`, `/contact-us`, `/certifications`, legal, `/insights` | nothing (no frames) | — |

### Sourced and rejected (2026-09-19)

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

Delete `src/content/placeholders.ts`, `src/components/ui/monogram.tsx`, the `monograms` prop on `Testimonials`, the guard block in `next.config.ts`, and this file. Nothing else references them.
