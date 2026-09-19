# Placeholder imagery — presentations only

The site's photo frames are reserved for TDL's own photography (`docs/CLIENT-QUESTIONS.md` Q18, Q26, Q27) and stay visibly empty until it arrives. For client presentations, `PLACEHOLDER_IMAGES=true` fills the *non-person* frames with the licensed stock below. Every placeholder renders with a visible **"Placeholder — TDL photography required"** label and a photo credit.

## It cannot ship by accident

- Default is off. `PLACEHOLDER_IMAGES` is unset or `false` in every environment unless someone sets it for a demo.
- `next.config.ts` **throws** if `PLACEHOLDER_IMAGES=true` on a production target: a Vercel production deployment, or any local `next build` not explicitly marked with `PLACEHOLDER_PRESENTATION_BUILD=1`. Preview deployments are allowed.
- Flag off, the frames return to the empty reserved state. Nothing else changes.

## Never a face

The three testimonial portrait frames (Chidi Okonkwo, Mr. Michael Kehinde, Dorothy Akpati) and, on `/about-us`, the leadership and board frames never show a stock or generated face: a face under a real named person manufactures a likeness. With the flag on they show an **initials monogram** (CO, MK, DA) in Archivo Expanded, `--signal` on `--ink`, sized to the frame (`src/components/ui/monogram.tsx`). Flag off, they read "Portrait to come". The real-headshot ask stays open in `docs/CLIENT-QUESTIONS.md` Q26 / Q18.

## Registry (`src/content/placeholders.ts`)

All three are by the same Lagos photographer under the [Pexels licence](https://www.pexels.com/license/) (free to use, attribution not required, given anyway). Files in `public/placeholders/`, fetched at 1,600 px wide.

| Key | Where it appears | Scene | Photographer | Source |
|---|---|---|---|---|
| `home-office` | Home, "The office" frame before the close | Three colleagues around a laptop during a meeting in a Lagos office | [Ninthgrid](https://www.pexels.com/@ninthgrid-2149521550/) | [pexels.com/photo/30689114](https://www.pexels.com/photo/team-collaboration-meeting-in-lagos-office-30689114/) |
| `about-staff` | `/about-us`, staff at work (milestone 7) | A group of business professionals indoors, Lagos | Ninthgrid | [pexels.com/photo/30688595](https://www.pexels.com/photo/diverse-business-team-smiling-indoors-30688595/) |
| `about-work` | `/about-us`, the office at work (milestone 7) | Two colleagues collaborating on a laptop in a Lagos office | Ninthgrid | [pexels.com/photo/30677719](https://www.pexels.com/photo/professional-collaboration-in-lagos-office-30677719/) |

Not used: anything from Unsplash+ / Getty (paid), and anything that is not a Nigerian workplace.

## Running a presentation build

```
PLACEHOLDER_IMAGES=true PLACEHOLDER_PRESENTATION_BUILD=1 npm run build && npm start
```

or, for a Vercel preview deployment, set `PLACEHOLDER_IMAGES=true` on the **Preview** environment only.

## Removing them for good

Delete `public/placeholders/`, `src/content/placeholders.ts`, the `placeholder` props in the frames, and this file. Nothing else references them.
