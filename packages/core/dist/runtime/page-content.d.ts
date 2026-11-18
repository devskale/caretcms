import type { EntryData, StorageAdapter } from "../types.js";
/** collection → id → field path ("hero.headline") → the text (or image src) the template renders. */
export type PageContent = Record<string, Record<string, Record<string, string>>>;
/**
 * The content templates state for their `data-caret` bindings, scanned when
 * Astro starts (and again in dev when a template changes). Imported on each
 * use so a dev rescan is picked up without a restart.
 */
export declare function loadPageContent(): Promise<PageContent>;
/** The page's text fills each field path that has no stored value. */
export declare function merged(entry: EntryData | null, id: string, seed: Record<string, string> | undefined): EntryData | null;
/**
 * Reads that include what pages show before anything is saved: an entry the
 * templates bind appears with the page's own text, and stored values win
 * field by field. For the Studio and editor reads only; writes, revisions and
 * existence checks stay with the adapter, so nothing here is ever stored.
 */
export declare function withPageContent(adapter: StorageAdapter, content: PageContent): StorageAdapter;
/**
 * Leave out fields that still say exactly what the page says on its own, so
 * saving a whole entry from the Studio doesn't freeze template text that
 * nobody edited. A field set back to the page's text goes back to following it.
 */
export declare function withoutPageDefaults(data: Record<string, unknown>, seed: Record<string, string> | undefined): Record<string, unknown>;
/**
 * A collection that exists because templates bind it (no schema of its own):
 * its entries are the pages, so there's nothing to create, order or delete.
 */
export declare function isPageCollection(content: PageContent, collection: string, hasSchema: boolean): boolean;
//# sourceMappingURL=page-content.d.ts.map