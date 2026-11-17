/** Private overlay state. Never accepted from mutation payloads or exposed as content. */
export const DRAFT_STATE_KEY = "__caret_draft__";
export const PUBLISH_RECOVERY_KEY = "__caret_publish__";
export const PRIVATE_ENTRY_KEYS = ["__body", "__caret_tombstone__", DRAFT_STATE_KEY, PUBLISH_RECOVERY_KEY] as const;

export interface DraftState {
  version: 1;
  baseRevision: number;
  baseData: Record<string, unknown> | null;
  /** Structured saves replace the entry; body-only saves leave frontmatter alone. */
  structured: boolean;
}

export function contentWithoutState(data: Record<string, unknown>): Record<string, unknown> {
  const { [DRAFT_STATE_KEY]: _draft, [PUBLISH_RECOVERY_KEY]: _publish, ...content } = data;
  return content;
}

export function readDraftState(data: Record<string, unknown>): DraftState | null {
  const state = data[DRAFT_STATE_KEY] as DraftState | undefined;
  if (!state || state.version !== 1 || !Number.isSafeInteger(state.baseRevision) || state.baseRevision < 0 ||
      typeof state.structured !== "boolean" ||
      (state.baseData !== null && (typeof state.baseData !== "object" || Array.isArray(state.baseData)))) return null;
  return state;
}

/** Render-Pfad-Guard (Incident 1 / Groundhog Day): ein Draft mit baseRevision
 *  ungleich der aktuellen Base-Revision — oder mit anderem Baseninhalt — ist
 *  veraltet. Veraltete strukturierte Drafts dürfen NICHT über neueren Repo-Inhalt
 *  gerendert werden; publish.ts lehnt sie mit stale_entry ab (gleiche Prüfung). */
export function isStaleDraft(
  state: DraftState,
  baseData: Record<string, unknown> | null,
  baseRevision: number,
): boolean {
  return state.baseRevision !== baseRevision || !sameContent(state.baseData, baseData);
}

/** Object key ordering is not a content change. Arrays retain their order. */
export function sameContent(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const left = Object.keys(a), right = Object.keys(b);
  return left.length === right.length && left.every(key => Object.hasOwn(b, key) &&
    sameContent((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
}
