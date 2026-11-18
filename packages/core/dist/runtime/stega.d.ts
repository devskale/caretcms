/**
 * Vendored steganographic encoder for Content Source Maps.
 *
 * Hides a small JSON payload (e.g. a Caret binding key) *inside* a string by
 * appending invisible Unicode "tag" characters (U+E0000–U+E007F, the Unicode
 * Tags block, which render to nothing). Because the metadata lives in the string
 * value itself — not on a DOM element — it survives flowing through component
 * props, slots, and `.map()` loops, and can later be decoded from a rendered DOM
 * text node to power click-to-edit overlays with no `data-caret` attribute.
 *
 * This is the same technique used by `@vercel/stega`, reimplemented here in a
 * few lines so `@caretcms/core` keeps ZERO runtime dependencies. The wire format
 * is Caret's own (Caret encodes and Caret decodes), so it is intentionally
 * simple rather than byte-compatible with Vercel's envelope.
 *
 * Isomorphic: encode/clean run server-side (loaders, middleware); decode runs in
 * the editor's browser bundle. Published output MUST be run through stegaClean().
 */
/**
 * Append `payload` to `value` as invisible metadata. The returned string looks
 * and prints identically to `value`, but carries the payload for later decode.
 */
export declare function stegaCombine(value: string, payload: unknown): string;
/**
 * Extract the hidden payload from a string, or `undefined` if there is none
 * (or it is malformed). Safe to call on any string, encoded or not.
 */
export declare function stegaDecode<T = unknown>(value: string): T | undefined;
/** Strip ALL stega metadata, returning the clean visible string. */
export declare function stegaClean(value: string): string;
/** Convenience: the cleaned string and the decoded payload in one call. */
export declare function stegaSplit<T = unknown>(value: string): {
    cleaned: string;
    payload: T | undefined;
};
/** Whether a string carries any stega metadata. */
export declare function hasStega(value: string): boolean;
//# sourceMappingURL=stega.d.ts.map