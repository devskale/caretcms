export type ParseResult = {
    ok: true;
    data: Record<string, unknown>;
    bodyStart: number;
} | {
    ok: false;
    reason: string;
};
export type SerializeResult = {
    ok: true;
    content: string;
} | {
    ok: false;
    reason: string;
};
export declare function parseFrontmatter(source: string): ParseResult;
/**
 * Serialize a data record into a YAML frontmatter block (WITHOUT the `---`
 * fences; the adapter composes those around it). Returns `{ ok: false }` if any
 * value cannot be safely represented (non-finite number, Date, function, …) so
 * the write is rejected before touching the file.
 */
export declare function serializeFrontmatter(data: Record<string, unknown>): SerializeResult;
export declare function rewriteFrontmatter(source: string, data: Record<string, unknown>): SerializeResult;
//# sourceMappingURL=frontmatter-codec.d.ts.map