/**
 * mdast node types that make their subtree non-editable: their inner text is
 * either structured (tables), reference plumbing (footnote definitions), or
 * raw/JSX passthrough that markdown block editing can't safely round-trip.
 */
export declare const ISLAND_TYPES: ReadonlySet<string>;
export interface ResolvedEntry {
    collection: string;
    id: string;
}
/**
 * Resolve a source file to its `{collection, id}` under the content root, or
 * `null`. v1 scope: flat `<contentRoot>/<collection>/<id>.md` only — `.mdx`,
 * nested slugs, and identifiers failing the id grammar are intentionally
 * unmatched (and so never stamped).
 */
export declare function resolveEntry(fileURL: string | URL | undefined, contentRoot: string): ResolvedEntry | null;
export type ParagraphPlan = {
    action: "skip";
} | {
    action: "self";
    nested: boolean;
} | {
    action: "parent";
};
/**
 * Decide how a paragraph maps to a bound element. A list item renders its text
 * on the `<li>` (a tight list drops the `<p>` entirely), so we bind the item —
 * via its FIRST paragraph, using that paragraph's marker-free offsets. Other
 * paragraphs bind themselves; `nested` marks those inside a container.
 */
export declare function planParagraph(parentType: string, indexInParent: number | undefined): ParagraphPlan;
export interface StampInput {
    /** The exact source string the pipeline parsed (offsets are relative to it). */
    source: string;
    /** The file being rendered. */
    fileURL: string | URL | undefined;
    /** Absolute content root the markdown adapter reads from. */
    contentRoot: string;
    /** unist offsets of the block whose text the binding edits. */
    start: number | undefined;
    end: number | undefined;
    /** Root-to-element child indexes identifying the bound element. */
    blockPath: readonly number[];
    /** Types of the bound node's ancestors (island detection). */
    ancestorTypes: readonly string[];
    /** True when the block sits inside a container (blockquote / list item). */
    nested: boolean;
    /** mdast node type of the bound block ("heading" | "paragraph" | "listItem"). */
    blockType?: string;
}
/**
 * Compute the `{data-caret-md, data-caret-md-src}` attributes for one block, or
 * `null` to leave it unstamped. Offsets are normalized to the canonical body
 * base (frontmatter-stripped, trimmed) so a `.md` import, a content-collection
 * entry, and Astro 6 remark all yield the same numbers.
 */
export declare function computeStamp(input: StampInput): Record<string, string> | null;
//# sourceMappingURL=stamp.d.ts.map