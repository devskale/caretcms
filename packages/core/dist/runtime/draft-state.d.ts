/** Private overlay state. Never accepted from mutation payloads or exposed as content. */
export declare const DRAFT_STATE_KEY = "__caret_draft__";
export declare const PUBLISH_RECOVERY_KEY = "__caret_publish__";
export declare const PRIVATE_ENTRY_KEYS: readonly ["__body", "__caret_tombstone__", "__caret_draft__", "__caret_publish__"];
export interface DraftState {
    version: 1;
    baseRevision: number;
    baseData: Record<string, unknown> | null;
    /** Structured saves replace the entry; body-only saves leave frontmatter alone. */
    structured: boolean;
}
export declare function contentWithoutState(data: Record<string, unknown>): Record<string, unknown>;
export declare function readDraftState(data: Record<string, unknown>): DraftState | null;
/** Object key ordering is not a content change. Arrays retain their order. */
export declare function sameContent(a: unknown, b: unknown): boolean;
//# sourceMappingURL=draft-state.d.ts.map