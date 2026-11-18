import type { StorageAdapter } from "../types.js";
export type UnpublishedEntry = {
    collection: string;
    id: string;
    deleted: boolean;
};
/** Entries in one collection whose draft differs from what visitors see (see `draftChange`). */
export declare function unpublishedEntries(collection: string): Promise<UnpublishedEntry[]>;
/**
 * How many entries in an editor's draft store still need publishing: drafts
 * that change what visitors see, and drafts holding an unfinished publish.
 */
export declare function countPendingDrafts(base: StorageAdapter, overlay: StorageAdapter): Promise<number>;
/** Every entry the current editor has not published yet, across collections. */
export declare function allUnpublishedEntries(): Promise<UnpublishedEntry[]>;
/** Whether the current request works on drafts that need publishing. */
export declare function worksOnDrafts(): boolean;
//# sourceMappingURL=unpublished.d.ts.map