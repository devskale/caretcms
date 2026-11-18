/**
 * Astro LiveLoader backed by the configured StorageAdapter.
 *
 * Compatible with Astro 6 and 7 (stable live content collections). On Astro 7
 * the loader also attaches `cacheHint` tags for publish-time purging.
 *
 * Usage in src/caret.config.ts:
 *
 *   import { defineLiveCollection } from 'astro:content';
 *   import { caretLoader } from '@caretcms/core';
 *
 *   const pages = defineLiveCollection({
 *     loader: caretLoader('pages'),
 *   });
 *   export const collections = { pages };
 */
export declare class CaretLoaderError extends Error {
    constructor(message: string, cause?: unknown);
}
type CaretEntryFilter = {
    id: string;
};
/**
 * Astro 7 live-collection cache hint (structural — see CaretLiveLoader). Lets the
 * loader tag returned data so a route/CDN cache can be invalidated by tag. Astro
 * 6 (which predates cacheHint) simply ignores the extra field.
 */
type CaretCacheHint = {
    tags?: string[];
    lastModified?: Date;
};
type CaretLiveDataEntry = {
    id: string;
    data: Record<string, unknown>;
    cacheHint?: CaretCacheHint;
};
type CaretLiveDataCollection = {
    entries: CaretLiveDataEntry[];
    cacheHint?: CaretCacheHint;
};
type CaretLoadEntryContext = {
    filter: CaretEntryFilter;
    collection: string;
};
type CaretLoadCollectionContext = {
    filter?: Record<string, unknown>;
    collection: string;
};
/**
 * Structural LiveLoader type that is compatible with Astro's LiveLoader
 * interface (6.x and 7.x) without importing it directly — avoids hard
 * peer-dep coupling at the type level and lets a single build target both
 * major versions.
 */
export type CaretLiveLoader = {
    name: string;
    loadEntry: (context: CaretLoadEntryContext) => Promise<CaretLiveDataEntry | undefined | {
        error: CaretLoaderError;
    }>;
    loadCollection: (context: CaretLoadCollectionContext) => Promise<CaretLiveDataCollection | {
        error: CaretLoaderError;
    }>;
};
/**
 * Create an Astro LiveLoader that reads from the configured StorageAdapter.
 * Works on Astro 6 and 7.
 *
 * @param collection - The collection name (must be known to the adapter).
 */
export declare function caretLoader(collection: string): CaretLiveLoader;
export {};
//# sourceMappingURL=loader.d.ts.map