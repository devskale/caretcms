/**
 * Shared rich-text allowlist + class matcher.
 *
 * The single source of truth for what the rich-text sanitizers keep. Imported
 * by the two TypeScript sanitizers — the server render path (sanitize-html.ts,
 * regex-based, no DOM) and the cloud live-sync path (browser-runtime.ts, DOM).
 *
 * The editor-save sanitizer in static/cms/editor/sanitize.js is shipped as raw,
 * unbundled JS, so it can't import this module — it MUST mirror these values
 * and the classAllowed() logic by hand. That hand mirror is held in lockstep by
 * tests/unit/contracts-parity.test.ts ("browser sanitizer parity"), which fails
 * CI on any drift (W0). Keep all three sanitizers in lockstep.
 */
export declare const RICH_ALLOWED_TAGS: Set<string>;
/** Attributes preserved per tag (class is gated separately, by allowedClasses). */
export declare const RICH_ALLOWED_ATTRS: Record<string, Set<string>>;
/**
 * Astro's scoped-style marker (`data-astro-cid-<hash>`), which Astro adds to
 * every element a component with a `<style>` renders. It is kept on allowed
 * tags, always with an empty value, so a component's styles still apply to a
 * `<strong>` or `<a>` after its rich text is saved. A valueless data attribute
 * runs nothing and only matches the component's own `[data-astro-cid-…]`
 * selectors; the name pattern admits no other attribute.
 */
export declare const SCOPED_STYLE_ATTR_RE: RegExp;
export declare const SAFE_HREF_RE: RegExp;
/**
 * Per-tag class allowlist. Keys are tag names, values are allowed class names.
 * A pattern ending in `*` is a prefix match (`text-*` allows `text-primary`);
 * a lone `*` allows any class on that tag. Anything not matched is dropped.
 * Mirrors the `allowedClasses` option of the `sanitize-html` package.
 */
export type AllowedClasses = Record<string, readonly string[]>;
/** Does `cls` match any pattern in `patterns`? (exact, `prefix-*`, or lone `*`) */
export declare function classAllowed(cls: string, patterns: readonly string[]): boolean;
/** Filter a raw class attribute value to the tag's allowed patterns. */
export declare function filterClasses(value: string, patterns: readonly string[]): string;
//# sourceMappingURL=rich-allowlist.d.ts.map