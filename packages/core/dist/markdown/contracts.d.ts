/**
 * Contract surface for markdown BODY inline editing (v0.3.0).
 *
 * These identifiers gate a security- and correctness-critical path: the
 * `data-caret-md` attribute binds a rendered block back to a byte range in a
 * source `.md` file, and a Publish splices edited markdown into that range.
 * The grammar, the source-hint format, and the content hash are therefore a
 * compatibility promise shared across the render-time stamping plugins, the
 * mutation engine, the publish splicer, and the browser editor.
 *
 * Zero-dependency by policy (core ships no runtime deps). The browser editor
 * ships as raw unbundled JS and hand-mirrors the pieces it needs
 * (`static/cms/editor/md-serialize.js`); a parity test holds the mirror to
 * this source of truth.
 */
/** Attribute carrying the block binding (`collection::id::body::blockPath`). */
export declare const CARET_MD_ATTR = "data-caret-md";
/** Attribute carrying the source hint (`start:end:hash`). */
export declare const CARET_MD_SRC_ATTR = "data-caret-md-src";
/**
 * Reserved field name for the body-draft map inside an entry's draft overlay
 * `data`. Read boundaries strip it so it never surfaces to schema/loader
 * consumers.
 */
export declare const BODY_OVERLAY_KEY = "__body";
/** The synthetic field segment identifying a body binding (vs a `data-caret` field). */
export declare const BODY_FIELD = "body";
/**
 * A block path: dot-joined child indexes from the mdast root to the block node
 * (`"4"` = fifth top-level block; `"6.2"` = third child of the seventh block).
 * Stable identity for the block within an entry across edits.
 */
export declare const BLOCK_PATH_RE: RegExp;
export interface MdBinding {
    collection: string;
    id: string;
    blockPath: string;
}
/** Format a block path from root-to-node child indexes. */
export declare function formatBlockPath(indexes: readonly number[]): string;
/** Parse a block path into its child indexes, or `null` if malformed. */
export declare function parseBlockPath(raw: string): number[] | null;
/** Format a `data-caret-md` binding value. */
export declare function formatMdBinding(b: MdBinding): string;
/** Parse a `data-caret-md` binding value, or `null` if it fails the grammar. */
export declare function parseMdBinding(raw: string): MdBinding | null;
export interface MdSrc {
    /** Start offset in the canonical body (see `canonical-body.ts`). */
    start: number;
    /** End offset (exclusive) in the canonical body. */
    end: number;
    /** `fnv1a32` of the canonical body slice `[start, end)`. */
    hash: string;
}
/** Format a `data-caret-md-src` hint value. */
export declare function formatMdSrc(s: MdSrc): string;
/** Parse a `data-caret-md-src` hint, validating bounds and hash shape. */
export declare function parseMdSrc(raw: string): MdSrc | null;
/**
 * FNV-1a (32-bit) hash as an 8-char lowercase hex string. Not cryptographic —
 * a staleness fingerprint over a source slice, chosen for a dependency-free,
 * byte-identical implementation on both the TS and browser-JS sides. Iterates
 * UTF-16 code units, so the two sides must hash the same string form.
 */
export declare function fnv1a32(str: string): string;
//# sourceMappingURL=contracts.d.ts.map