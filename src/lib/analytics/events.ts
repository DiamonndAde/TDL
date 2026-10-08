/**
 * Every event the site may send, and the exact properties each carries. The union is the contract: `track()`
 * takes nothing else, so a property can only be added here, in the open, where the rule below is visible.
 *
 * **No event carries anything a visitor typed.** Field events record that a field was reached and in what
 * state — `empty`, `filled`, `invalid` — never its contents. `first_invalid_field` and `field` are field
 * *names* from a closed list, not values. `headcount_band` is the band the visitor picked, which is already a
 * bucket; `services_count` and `fields_completed` are counts. If a future event needs a value, it does not go
 * in (docs/ANALYTICS-PROPOSAL.md §2).
 */

/** Form field identifiers. Names, never values — and a closed list so a typo cannot smuggle one in. */
export type FieldName =
  // talent pool (/careers)
  | "name" | "email" | "phone" | "location" | "area" | "message" | "consent"
  // enquiry (/become-a-client)
  | "services" | "headcount" | "organisation" | "industry" | "arrangement" | "role" | "contactTime";

export type FieldState = "empty" | "filled" | "invalid";

export type AnalyticsEvent =
  // --- /careers -------------------------------------------------------------------------------------------
  | { name: "careers_viewed" }
  | { name: "openings_clicked"; destination: "ats"; cta_variant: CtaVariantName }
  | { name: "talent_pool_started" }
  | { name: "talent_pool_submitted"; fields_completed: number }
  | { name: "talent_pool_failed"; reason: FailureReason }
  // --- /become-a-client -----------------------------------------------------------------------------------
  | { name: "enquiry_viewed"; preselected_service: string }
  | { name: "enquiry_step_viewed"; step: 1 | 2 | 3 }
  | { name: "enquiry_step_completed"; step: 1 | 2 | 3 }
  | { name: "enquiry_step_blocked"; step: 1 | 2 | 3; first_invalid_field: FieldName }
  | { name: "enquiry_step_back"; step: 1 | 2 | 3 }
  | { name: "enquiry_submitted"; services_count: number; headcount_band: string }
  | { name: "enquiry_failed"; reason: FailureReason }
  // --- both forms -----------------------------------------------------------------------------------------
  | { name: "form_field_focused"; form: FormId; field: FieldName; index: number }
  | { name: "form_field_left"; form: FormId; field: FieldName; index: number; state: FieldState }
  | { name: "form_validation_failed"; form: FormId; field: FieldName; reason: ValidationReason };

/**
 * Why a submission failed, as a closed list. This is the whole of the site's error reporting on these two
 * routes: PostHog's exception autocapture is switched off, because an unhandled error's message and stack can
 * carry whatever was being processed when it threw — on a form, that is the applicant's answers. A fixed set of
 * reasons tells TDL that submissions are failing and which way, and can contain nothing else by construction.
 *
 *  - `delivery`     the ATS or webhook refused or errored; the person was told to try again
 *  - `unconfigured` nothing is wired up to receive it — a deployment mistake, and the loudest one
 *  - `validation`   the server re-validated and disagreed with the browser; should be rare and worth seeing
 *  - `network`      the request never completed
 */
export type FailureReason = "delivery" | "unconfigured" | "validation" | "network";

/**
 * Why the browser refused a field. A closed list, like `FailureReason`: zod's own message would be a readable
 * sentence, and a sentence is a place a value could end up.
 */
export type ValidationReason = "invalid" | "missing";

/**
 * Which wording of the careers call-to-action was on screen. A key from the experiment's own map, never the
 * label text — see `experiment.ts`. "control" whenever the experiment is off, which is every build today.
 */
export type CtaVariantName = "control" | "roles" | "apply";

export type FormId = "talent_pool" | "enquiry";
export type EventName = AnalyticsEvent["name"];
