# Placeholder imagery — presentations only

The site's photo frames are reserved for TDL's own photography (`docs/CLIENT-QUESTIONS.md` Q18, Q26, Q27) and stay visibly empty until it arrives. For client presentations, `PLACEHOLDER_IMAGES=true` currently fills only the named-person frames, with initials monograms. Any future photographic placeholder must be registered below with attribution and renders with a visible **"Placeholder — TDL photography required"** label and a photo credit.

## It cannot ship by accident

- Default is off. `PLACEHOLDER_IMAGES` is unset or `false` in every environment unless someone sets it for a demo.
- `next.config.ts` applies one rule everywhere — locally, on a Vercel preview, on a Vercel production deployment: with `PLACEHOLDER_IMAGES` on, a **production target** (`NODE_ENV=production` and `VERCEL_ENV` not `preview`) builds only if `PLACEHOLDER_PRESENTATION_BUILD` is also set; otherwise the build **fails** and the error prints every value it saw (`PLACEHOLDER_IMAGES`, `PLACEHOLDER_PRESENTATION_BUILD`, `NODE_ENV`, `VERCEL_ENV`, `VERCEL`). A Vercel **preview** needs only `PLACEHOLDER_IMAGES` — previews run with `NODE_ENV=production`, and `VERCEL_ENV=preview` is what tells them apart from the live deployment. Both variables are read the same way (trimmed, quotes stripped, case-insensitive; `true`/`1`/`yes`/`on`).
- When a production target does build with both set, the build log carries `[placeholder guard] Presentation build … Remove … before launch`. **Before launch, remove both variables from the Vercel Production environment.** That is a checklist item, not a guard.
- Flag off, the frames return to the empty reserved state. Nothing else changes.

## Never a face

The three testimonial portrait frames (Chidi Okonkwo, Mr. Michael Kehinde, Dorothy Akpati) and, on `/about-us`, the leadership and board frames never show a stock or generated face: a face under a real named person manufactures a likeness. With the flag on they show an **initials monogram** (CO, MK, DA) in Archivo Expanded, `--signal` on `--ink`, sized to the frame (`src/components/ui/monogram.tsx`). Flag off, they read "Portrait to come". The real-headshot ask stays open in `docs/CLIENT-QUESTIONS.md` Q26 / Q18.

## Registry (`src/content/placeholders.ts`) — empty by decision

No photographic placeholders are registered. Three candidates for the home "office" frame were sourced and rejected (2026-09-19): an Abuja office block (wrong city, cars in shot), a Lagos railway-station entrance, and the Bank of Industry headquarters — every one would have sat under the caption "Total Data Limited, 69 Coker Road, Ilupeju, Lagos" and asserted something false. The same holds for the `/about-us` frames, captioned as TDL's own staff and office. Free Nigerian office interiors without people do not exist on Pexels or Unsplash; posed groups were rejected earlier for reading as other people's staff.

The empty frame, reading "Photograph to come", is the honest presentation state and the better prompt to the client (Q18, Q26, Q27). `PlaceholderKey` is `never`, so a frame cannot be given a placeholder until an entry is added here deliberately, with photographer, source and licence.

With the flag on, the only visible effect is the initials monograms in the named-person frames.

## Running a presentation build

```
PLACEHOLDER_IMAGES=true PLACEHOLDER_PRESENTATION_BUILD=1 npm run build && npm start
```

or, on Vercel: set `PLACEHOLDER_IMAGES=true` on the **Preview** environment (nothing else needed), or on Production set both `PLACEHOLDER_IMAGES=true` and `PLACEHOLDER_PRESENTATION_BUILD=1` for the presentation and remove both afterwards.

## Removing the mechanism for good

Delete `src/content/placeholders.ts`, `src/components/ui/monogram.tsx`, the `monograms` prop on `Testimonials`, the guard block in `next.config.ts`, and this file. Nothing else references them.
