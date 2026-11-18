/**
 * Public content loading API for Astro pages.
 *
 * Use these in your .astro frontmatter to load CMS content:
 *
 *   import { loadEntry, loadCollection } from '@caretcms/core/runtime'
 *
 *   const home = await loadEntry('pages', 'home')
 *   const posts = await loadCollection('posts')
 */
import type { EntryData } from "../types.js";
export type { EntryData };
/**
 * Load a single entry by collection and id.
 * Returns the entry data, or null if not found.
 */
export declare function loadEntry(collection: string, id: string): Promise<Record<string, unknown> | null>;
/**
 * Load all entries in a collection.
 * Returns an array of { id, data } objects.
 */
export declare function loadCollection(collection: string): Promise<EntryData[]>;
/**
 * Discover all collection names.
 * Returns sorted collection names.
 */
export declare function listCollections(): Promise<string[]>;
//# sourceMappingURL=content.d.ts.map