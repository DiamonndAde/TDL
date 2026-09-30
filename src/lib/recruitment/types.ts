/**
 * The recruitment port: everything the site asks of an applicant tracking system, and nothing about which one.
 *
 * TDL runs Zoho Recruit today and may not always (Q29). The site talks to this interface; one adapter per
 * provider sits behind it. Swapping ATS is then a new file in this directory and one environment variable, not
 * a change to a page or a server action.
 *
 * **The site stores no candidate data.** Every method here is a pass-through to the provider: nothing is
 * written to disk, to a database or to a log on our side. Holding applicants' personal data would make this
 * site a data controller under the NDPR, with retention, access and deletion duties attached — that belongs in
 * the ATS, which already has them (docs/DESIGN-DECISIONS.md, "If TDL leaves Zoho").
 */

/** A live opening, as the site would render it. `applyUrl` always points at the provider — we never take an application. */
export interface Opening {
  id: string;
  title: string;
  /** City or state as the ATS holds it; omitted rather than guessed. */
  location?: string;
  /** e.g. "Full time", "Contract". */
  employmentType?: string;
  /** ISO date the opening was published. */
  postedAt?: string;
  /** The provider's own page for this opening, where the candidate applies. */
  applyUrl: string;
  description?: string;
}

/** One talent-pool submission. Exactly the fields the form collects — the schema is the contract. */
export interface CandidateDraft {
  name: string;
  email: string;
  phone: string;
  /** City or state the person gave. */
  location: string;
  /** Service line they want to work in. */
  area: string;
  /** Free text; may be empty. */
  message: string;
  /** ISO timestamp of the NDPR consent tick, so the provider records when consent was given. */
  consentAt: string;
  /** Where the submission came from, e.g. "totaldatalimited.com/careers". */
  source: string;
}

export interface Note {
  title: string;
  content: string;
}

/**
 * Why a call did not succeed. `unsupported` is a provider that cannot do this at all (the webhook has no
 * concept of an opening); `unconfigured` is a provider missing its credentials; `failed` is a real error.
 * Callers distinguish them because only `failed` is worth telling the visitor about.
 */
export type ProviderFailure = { ok: false; reason: "unsupported" | "unconfigured" | "failed"; detail?: string };
export type ProviderResult<T> = { ok: true; value: T } | ProviderFailure;

export interface ProviderCapabilities {
  /** Can return the current openings for rendering in our own design. */
  listOpenings: boolean;
  /** Can take a talent-pool submission. */
  createCandidate: boolean;
  /**
   * Can attach a note to a candidate after creating it. A provider that reports `false` here **must deliver
   * `draft.message` itself** inside `createCandidate` — nothing the applicant wrote may be dropped.
   */
  addNote: boolean;
}

export interface RecruitmentProvider {
  /** Short identifier for logs and the handoff docs, e.g. "zoho-recruit". */
  readonly name: string;
  /**
   * The provider's own careers board, where openings are listed and applications are made. `null` when the
   * provider has no such page, in which case the careers page drops the "See current openings" button rather
   * than linking somewhere that does not exist.
   */
  readonly openingsUrl: string | null;
  readonly capabilities: ProviderCapabilities;
  /**
   * Decorate an outbound link to the provider so it can record where the candidate came from. How that is
   * spelled is provider knowledge — Zoho has a `Source` field and its career-site URLs accept a parameter —
   * so the analytics layer asks for a URL and never learns the parameter's name.
   *
   * Returns the URL untouched when the provider has no such mechanism or it has not been configured. It is
   * deliberately opt-in: whether Zoho's career site actually writes the parameter onto the candidate record is
   * unconfirmed (CLIENT-QUESTIONS.md Q29f), and a parameter that does nothing is noise in a link.
   */
  handoffUrl(url: string, source: string): string;
  listOpenings(): Promise<ProviderResult<Opening[]>>;
  createCandidate(draft: CandidateDraft): Promise<ProviderResult<{ id: string }>>;
  addNote(candidateId: string, note: Note): Promise<ProviderResult<void>>;
}

export const unsupported = (what: string): ProviderFailure => ({ ok: false, reason: "unsupported", detail: what });
