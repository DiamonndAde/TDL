# Screenshots

Review captures from each milestone, produced by the scripts in `scripts/` against a production build (`next build && next start`) in headless Chromium. Full-page captures only ever show the Roster's drift state (a full-page capture happens at scroll 0); the per-section captures scroll to each section and wait for the marks to settle.

## Milestone 1 — ground comparison (`docs/explorations/ground-comparison.html`)

| File | What |
|---|---|
| `ground-olive.png` | (a) olive-black `#1F2113` — rejected (khaki read) |
| `ground-teal.png` | (b) teal-black `#122326` — rejected |
| `ground-navy.png` | (c) navy `#0F1B2D` — approved |

## Milestone 3 — the Roster in isolation (`/dev/roster`, 1280×900 @2×)

| File | What |
|---|---|
| `m3-drift.png` | Hero state, 5,000 marks |
| `m3-map.png` | Nigeria and Benin Republic, even density |
| `m3-columns-active.png` | Seven service columns, column 4 (payroll) active |
| `m3-path.png` | Lifecycle stream |
| `m3-mark.png` | The TDL mark formed from the population |

## Milestone 4 — home page

| File | What |
|---|---|
| `m4-final-desktop.png` | Full page, 1280 wide (drift state only, see above) |
| `m4-final-mobile.png` | Full page, 390 wide @2× |
| `m4-390-sheet.png` | All nine sections at 390 wide, each with the Roster settled |
| `m4-1280-top.png` | Hero |
| `m4-1280-proof.png` | Proof bar mid-transition to the map |
| `m4-1280-coverage.png` | Coverage |
| `m4-1280-services.png` | Services, columns settled |
| `m4-1280-lifecycle.png` | Lifecycle line, stops and stream |
| `m4-1280-work.png` | Work |
| `m4-1280-testimonials.png` | Testimonials and clients |
| `m4-1280-close.png` | Close, the mark condensed |

Regenerate: `bash scripts/serve-and-run.sh python scripts/home-shots.py <outdir> 1280 900 1` (and `390 844 2`).

## Milestone 5 — `/become-a-client`

| File | What |
|---|---|
| `m5-form-sheet.png` | Step 1 with a pre-selected service, step 3 with validation errors, the success state; and the same at 390 wide |

Regenerate: `bash scripts/serve-and-run.sh python scripts/form-proof.py <outdir>` (add `390 844 2` for phone).

## Milestone 6 — services

| File | What |
|---|---|
| `m6-services-sheet.png` | `/services` index at 1280 and `/services/payroll-management` at 390 |
| `m6-service-payroll.png` | `/services/payroll-management` at 1280, the lane lifted |
