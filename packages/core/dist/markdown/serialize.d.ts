/**
 * DOM-free markdown block serializer.
 *
 * Turns the inline content of ONE editable block into markdown source. The
 * closed set is deliberately tiny — text, `strong`/`b`, `em`/`i`, `a[href]`,
 * `code`, `br` — so serialization is a small, total, reversible function
 * rather than a general HTML→markdown converter. Anything outside the set is a
 * hard error: the browser sanitizes to this set before serializing, so a throw
 * means a bug or an attack, never normal input.
 *
 * Pure and DOM-free by design: it operates on a minimal {@link SNode} tree so
 * it can be property-tested in Node without a DOM, and the browser editor
 * (`static/cms/editor/md-serialize.js`) supplies a matching tree from real DOM
 * nodes. A parity test holds the two implementations to identical output.
 *
 * Known limitations (CommonMark/GFM constraints, not corruption — text is
 * always preserved; only emphasis boundaries or auto-linking may shift):
 *  - Abutting emphasis whose first span ends in punctuation and is followed by
 *    a word char: asterisks fuse, underscore can't close (see `emphasisMarker`).
 *  - Emphasis that starts with punctuation-leading content (e.g. a link) while
 *    immediately preceded by a word char: the opening `*`/`_` is not
 *    left-flanking, so the emphasis can't open. Unrepresentable in CommonMark.
 *  - A bare email/URL in plain text (`a@b.com`, `www.x.com`) is auto-linked by
 *    GFM on render; a second edit then serializes it as an explicit link.
 *  - Links normalize to untitled inline form: editing a block rewrites
 *    reference-style links (`[x][1]`) as inline links and drops link titles
 *    (`"…"`) — text and destination are preserved, the definition lines
 *    elsewhere in the document are untouched. Title support needs `title` in
 *    the shared rich allowlist (v0.4 candidate).
 * The editor doesn't produce these from normal selection-based formatting, so
 * they are documented rather than special-cased.
 */
/** A minimal, DOM-independent representation of inline content. */
export type SNode = {
    type: "text";
    value: string;
} | {
    type: "element";
    tag: string;
    attrs: Record<string, string>;
    children: SNode[];
};
/** Which block wraps the inline content — determines markers and break rules. */
export type BlockContext = {
    block: "heading";
    level: number;
} | {
    block: "paragraph";
    nested: boolean;
};
/** Thrown when the tree contains anything outside the closed inline set. */
export declare class SerializeError extends Error {
    constructor(message: string);
}
/**
 * Serialize the inline children of one block to markdown source, ready to
 * splice into the block's source range.
 */
export declare function serializeBlock(children: readonly SNode[], ctx: BlockContext): string;
//# sourceMappingURL=serialize.d.ts.map