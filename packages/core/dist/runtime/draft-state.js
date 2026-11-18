/** Private overlay state. Never accepted from mutation payloads or exposed as content. */
export const DRAFT_STATE_KEY = "__caret_draft__";
export const PUBLISH_RECOVERY_KEY = "__caret_publish__";
export const PRIVATE_ENTRY_KEYS = ["__body", "__caret_tombstone__", DRAFT_STATE_KEY, PUBLISH_RECOVERY_KEY];
export function contentWithoutState(data) {
    const { [DRAFT_STATE_KEY]: _draft, [PUBLISH_RECOVERY_KEY]: _publish, ...content } = data;
    return content;
}
export function readDraftState(data) {
    const state = data[DRAFT_STATE_KEY];
    if (!state || state.version !== 1 || !Number.isSafeInteger(state.baseRevision) || state.baseRevision < 0 ||
        typeof state.structured !== "boolean" ||
        (state.baseData !== null && (typeof state.baseData !== "object" || Array.isArray(state.baseData))))
        return null;
    return state;
}
/** Object key ordering is not a content change. Arrays retain their order. */
export function sameContent(a, b) {
    if (a === b)
        return true;
    if (a === null || b === null || typeof a !== "object" || typeof b !== "object")
        return false;
    if (Array.isArray(a) !== Array.isArray(b))
        return false;
    const left = Object.keys(a), right = Object.keys(b);
    return left.length === right.length && left.every(key => Object.hasOwn(b, key) &&
        sameContent(a[key], b[key]));
}
//# sourceMappingURL=draft-state.js.map