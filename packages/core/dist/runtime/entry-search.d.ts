/** Fields that name an entry, in the order the Studio shows them as its title. */
/** Fields that usually name an entry, best first. A page's `name` is often a
 *  quoted person's, so title-like fields come before it. */
export declare const ENTRY_TITLE_KEYS: readonly ["title", "headline", "heading", "name", "label", "question", "company_name"];
/** How an entry matched a search: by its name (title or id), or inside a field. */
export type EntryMatch = {
    kind: "title";
} | {
    kind: "field";
    field: string;
    snippet: string;
};
/** Readable text of a stored value: tags dropped, entities decoded, whitespace collapsed. */
export declare function plainText(value: string): string;
/**
 * Match a lowercase query against an entry: its id or title first, then the
 * readable text of every other field.
 */
export declare function matchEntry(id: string, data: Record<string, unknown>, query: string): EntryMatch | null;
//# sourceMappingURL=entry-search.d.ts.map