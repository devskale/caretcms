/**
 * Canonical body base for markdown block offsets.
 *
 * Astro feeds the markdown processor a DIFFERENT source string per render path
 * (verified against Astro 7.0.6): direct `.md` imports blank the frontmatter
 * with equal-length whitespace, while content collections strip the
 * frontmatter and `.trim()` the body. Raw mdast offsets are therefore not
 * portable. Every `data-caret-md-src` offset is instead defined against ONE
 * canonical base — the frontmatter-stripped, trimmed body — so the stamping
 * plugin (any pipeline) and the server splicer agree on coordinates.
 *
 * Plugin side: `canonicalOffset = nodeOffset - (source.length - source.trimStart().length)`.
 * Server side: this module maps canonical offsets back to file offsets for the
 * publish splice.
 */
export interface CanonicalBody {
    /** The frontmatter-stripped, trimmed body — the offset base. */
    body: string;
    /** Map a canonical body offset to an absolute offset in the source file. */
    fileOffsetOf: (canonicalOffset: number) => number;
}
/**
 * Derive the canonical body and its offset mapping from a full source file.
 *
 * `body === fileSource.slice(bodyStart).trim()`, and `fileOffsetOf(0)` is the
 * first non-whitespace byte after the frontmatter fence. Trailing-whitespace
 * trimming does not affect the mapping (it only shortens `body`).
 */
export declare function canonicalBody(fileSource: string): CanonicalBody;
//# sourceMappingURL=canonical-body.d.ts.map