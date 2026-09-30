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
  | { name: "openings_clicked"; destination: "ats" }
  | { name: "talent_pool_started" }
  | { name: "talent_pool_submitted"; fields_completed: number }
  | { name: "talent_pool_failed"; reason: "delivery" | "unconfigured" }
  // --- /become-a-client -----------------------------------------------------------------------------------
  | { name: "enquiry_viewed"; preselected_service: string }
  | { name: "enquiry_step_viewed"; step: 1 | 2 | 3 }
  | { name: "enquiry_step_completed"; step: 1 | 2 | 3 }
  | { name: "enquiry_step_blocked"; step: 1 | 2 | 3; first_invalid_field: FieldName }
  | { name: "enquiry_step_back"; step: 1 | 2 | 3 }
  | { name: "enquiry_submitted"; services_count: number; headcount_band: string }
  // --- both forms -----------------------------------------------------------------------------------------
  | { name: "form_field_focused"; form: FormId; field: FieldName; index: number }
  | { name: "form_field_left"; form: FormId; field: FieldName; index: number; state: FieldState }
  | { name: "form_validation_failed"; form: FormId; field: FieldName; reason: string };

export type FormId = "talent_pool" | "enquiry";
export type EventName = AnalyticsEvent["name"];
