/**
 * Response-rewriting engine for attribute-first CMS (ADR-005).
 *
 * Scans rendered HTML for data-caret and data-caret-scope attributes,
 * batch-loads stored overrides from the StorageAdapter, and replaces
 * element content (text) or src (images) with stored values.
 *
 * v1 scope: text-only leaf nodes + <img> src swaps.
 * Child markup within the rich allowlist is rendered as rich text; any other
 * child markup is skipped: the editor keeps such elements read-only, and the
 * dev toolbar lists them.
 */
import type { StorageAdapter } from "../types.js";
type ScopeMatch = {
    collection: string;
    id: string;
};
/**
 * Tags whose text content the rewrite engine can swap (`data-caret` bindings).
 * `<img>` (src swap) is handled separately. This list is a PUBLIC CONTRACT:
 * caretize mirrors it as its candidate set (a parity test asserts equality) —
 * a `data-caret` on any tag outside this list saves through the editor but is
 * never injected into the public render (a silently inert binding).
 */
export declare const REWRITABLE_TEXT_TAGS: readonly ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "small", "strong", "em", "a", "li", "td", "th", "label", "button", "figcaption", "blockquote", "dt", "dd", "summary", "caption", "legend"];
/**
 * CANONICAL data-caret value resolution (exported for the parser parity test):
 * full triple as-is; bare field resolved against the nearest enclosing scope;
 * anything else (2 or 4+ parts) is not a binding. The hand-mirrored copies in
 * browser-runtime.ts, static/cms/editor/helpers.js, and
 * static/cms/dev-toolbar/app.js are held to this behavior by
 * tests/unit/caret-parser-parity.test.ts.
 */
export declare function resolveBinding(caretValue: string, scope: ScopeMatch | null): {
    collection: string;
    id: string;
    field: string;
} | null;
export declare function rewriteCaretAttributes(html: string, adapter: StorageAdapter, options?: {
    allowedClasses?: Record<string, readonly string[]>;
}): Promise<string>;
export {};
//# sourceMappingURL=rewrite.d.ts.map