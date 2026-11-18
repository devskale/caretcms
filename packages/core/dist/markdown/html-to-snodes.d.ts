/**
 * Server-side inline-HTML → SNode parser for the markdown body write path.
 *
 * Exists so the server NEVER trusts client-supplied markdown: an `md_block`
 * mutation carries only HTML, which is re-sanitized against the rich allowlist
 * and then converted here into the same minimal tree `serializeBlock` consumes.
 * The markdown that eventually gets spliced into a source file is therefore
 * always derived server-side, and anything outside the closed set hard-fails
 * in the serializer.
 *
 * Deliberately tiny and strict — this only needs to parse the SANITIZER'S
 * output (balanced inline tags, double-quoted attributes, standard entities),
 * not arbitrary HTML. Malformed input throws; the mutation returns 400.
 */
import type { SNode } from "./serialize.js";
export declare class HtmlParseError extends Error {
    constructor(message: string);
}
/**
 * Parse a sanitized inline-HTML fragment into SNodes. Throws
 * {@link HtmlParseError} on anything structurally unexpected (unbalanced tags,
 * malformed tag syntax, comments/doctypes/CDATA) — the sanitizer never emits
 * those, so their presence means the input didn't come through it.
 */
export declare function htmlToSNodes(html: string): SNode[];
//# sourceMappingURL=html-to-snodes.d.ts.map