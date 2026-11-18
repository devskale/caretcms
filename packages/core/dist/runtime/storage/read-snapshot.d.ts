import type { StorageAdapter, EntrySnapshot } from "../../types.js";
/** The fallback coordinates with CMS writes in this process, not external writers. */
export declare function readEntrySnapshot(adapter: StorageAdapter, collection: string, id: string): Promise<EntrySnapshot>;
/** Internal composition: caller already holds the CMS lock; never acquire it recursively. */
export declare function readAdapterSnapshot(adapter: StorageAdapter, collection: string, id: string): Promise<EntrySnapshot>;
export declare function readEntrySnapshots(adapter: StorageAdapter, collection: string, ids: readonly string[]): Promise<EntrySnapshot[]>;
/** Caller already holds every entry lock; batch order/cardinality are part of the contract. */
export declare function readAdapterSnapshots(adapter: StorageAdapter, collection: string, ids: readonly string[]): Promise<EntrySnapshot[]>;
//# sourceMappingURL=read-snapshot.d.ts.map