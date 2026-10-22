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

### Stock photograph (`placeholders`)

One photograph. Pexels licence (free to use; attribution given anyway, on the image and here). File in `public/placeholders/`, 1,600 px wide.

| Key | Frames | Scene | Photographer | Source |
|---|---|---|---|---|
| `desk-work` | `/about-us` → "At work" beside the empty Coker Road frame (3:2); `/careers` → header, no caption (3:2) | A woman standing at a desk reviewing charts on a laptop, Abuja office, natural light, back to camera, no visible branding | [Taiye Salawu](https://www.pexels.com/@taiyesalawu/) | [pexels.com/photo/36482981](https://www.pexels.com/photo/professional-woman-analyzing-data-on-laptop-36482981/) |

The four stock photographs the home slider used from 2026-10-17 (Ninthgrid 30688591, Oluwapamilerinayo Ajala 30970394, @disruptxn kwzWjTnDPLk, Oladipupo Ajisegiri 1405769) were retired on 2026-10-22 and their files removed; the sourcing record below is kept.

### AI-generated stand-ins for the home slider (`sliderStandIns`)

**AI-generated with OpenAI `gpt-image-2`** (Images API, 1536×1024, quality `medium`) by `scripts/generate-slider-images.mjs`. **Client-approved exception**: TDL asked on 2026-10-17 for generated images in the slider until their own photographs arrive (Q27); the owner approved the six below on 2026-10-22. They appear **only in presentation builds** (`PLACEHOLDER_IMAGES`, behind the build guard), **only in the home slider**, under the caption "Generated stand-in images, not TDL's staff. TDL's own photographs to come." They never sit in a frame that names a person or claims TDL's premises (AGENTS.md, Placeholders rules 1–3). Committed as WebP (quality 86); the PNG originals and the generation manifest stay in the gitignored `photo-picks/generated/`.

**Base prompt**, word for word in every image:

> Photorealistic candid photo of Nigerian professionals at work in a modern Lagos office, natural window light, warm tones, people engaged in real tasks, nobody looking at the camera, no visible logos, no readable text on screens or documents, landscape.

followed by `Scene: <scene>` and a framing line — round 1: "Keep the people and the main action in the middle horizontal band of the frame, with plain space above and below, so a very wide crop still shows them." — re-run: "Wide landscape composition with the people in the middle third of the frame; a full-bleed photograph with no borders, bars or blank bands. No lettering, logos or brand marks on any equipment, including the backs of monitors and laptop lids."

| Slide | File | Scene line | Framing | Processing |
|---|---|---|---|---|
| 1 | `generated/gen-meeting-standup.webp` 1536×1024 | Three colleagues standing by a window in a short working discussion, one holding a folder, another pointing at it. | round 1 | as generated |
| 2 | `generated/gen-admin-open-plan.webp` 1536×1024, phone `gen-admin-open-plan-phone.webp` 1300×975 | An open-plan administration office: two people at adjacent desks working on computers, a third walking past carrying files, slightly out of focus. | round 1 | phone source is a crop from the left (x 0–1300, y 25–1000), so the walking figure is out of frame rather than halved |
| 3 | `generated/gen-laptop-pair.webp` 1536×730 | Two colleagues side by side at one laptop, one explaining something on the screen to the other, screen angled away from the camera. | round 1 | painted letterbox bars trimmed (rows 147–876 kept) |
| 4 | `generated/gen-documents-records.webp` 1536×790 | A man filing folders into a shelf of labelled box files in a records room, labels blank or out of focus. | round 1 | painted letterbox bars trimmed (rows 118–907 kept) |
| 5 | `generated/gen-hr-interview.webp` 1536×1024 | An HR interview across a desk: the interviewer listening and taking notes, the candidate in profile mid-answer. | re-run | as generated |
| 6 | `generated/gen-payroll-desk.webp` 1536×1024 | A payroll officer at an admin desk with a calculator and a monitor turned away from the camera, checking figures on a printed sheet seen edge-on. | re-run | as generated |

**Checked at full size** before selection: hands, faces including background people, any text or logos, distortion. **Rejected**: round 1 `meeting-table`, `documents-review`, `hr-interview`, `laptop-pair`, `documents-records` came back with flat letterbox bars painted in (the round-1 framing line, taken literally; the last two were rescued by trimming), `documents-review` also had a logo-like mark on a background laptop lid, and `payroll-desk` had brand-like lettering on a monitor back — both re-run with the new framing and equipment lines and passed.

**Sharpness**: the desktop band shows ~1,920 device px across on a 2× laptop against 1,536 source px — slightly soft, accepted for the demo. On phones (358 CSS px, 716 device px at 2×, 1,074 at 3×) every image has at least 1,074 px except `laptop-pair` (973) and `documents-records` (1,053), which are 9% and 2% short on 3× phones only. Nothing was upscaled.

**Spend**: 10 images generated, **$0.4175** in total ($0.0417–$0.0418 each: 113 text-input tokens at $5/M and 1,372 image-output tokens at $30/M, from each response's own usage).

Faces are fine in the slider: it names no one and claims no premises, and its caption says the people are not TDL's staff. The face rule is about frames carrying a named person; the premises rule is about frames captioned with TDL's address.

### What each route shows with the flag on

| Route | Fills | Stays empty |
|---|---|---|
| `/` | The slider after the proof bar (six generated stand-ins, one caption line: "Generated stand-in images, not TDL's staff. TDL's own photographs to come."; until 2026-10-22 four stock photographs — `desk-work` is portrait and dropped out at 21:9 — one caption line: "Stand-in photographs. TDL's own to come." — no per-image badge or credit since 2026-10-17; credits are here); three testimonial portraits → monograms CO, MK, DA | — (flag off, the slider is a "Photographs to come" note naming the address) |
| `/about-us` | "At work" frame (`desk-work`); two leadership and three board portraits → monograms | "The office" frame captioned 69 Coker Road |
| `/careers` | Header frame (`desk-work`), no caption | — |
| `/contact-us` | — (the brochure QR code is marked "Demo build … Do not print it") | — |
| `/work`, `/services/*`, `/certifications`, legal, `/insights` | nothing (no frames) | — |

### Sourced and rejected (2026-10-17, stock for the home slider — retired 2026-10-22)

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

Delete `src/content/placeholders.ts`, `src/components/ui/monogram.tsx`, the `monograms` prop on `Testimonials`, the guard block in `next.config.ts`, the placeholder branch in `src/components/home/office.tsx`, `sliderStandIns` and `public/placeholders/generated/`, `scripts/generate-slider-images.mjs`, and this file. Nothing else references them.
