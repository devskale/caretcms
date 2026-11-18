import type { DeploymentTarget, RebuildReceipt } from "../../types.js";
import type { CollectionMetadata, EntryData, HistoryEntry, StorageAdapter } from "../../types.js";
export declare class InMemoryAdapter implements StorageAdapter {
    readonly guarantees: Readonly<{
        readonly persistence: "process";
        readonly snapshots: "process";
        readonly commits: "process";
        readonly collectionDeletion: "content";
    }>;
    private rebuildReceipt;
    private deploymentTarget;
    getRebuildReceipt(): Promise<RebuildReceipt | null>;
    setRebuildReceipt(receipt: RebuildReceipt | null): Promise<void>;
    getDeploymentTarget(): Promise<DeploymentTarget | null>;
    setDeploymentTarget(target: DeploymentTarget | null): Promise<void>;
    private collections;
    private revisions;
    private history;
    private collectionMeta;
    private editorOverlays;
    /** A persistent per-editor overlay store. Same id → same store, so a draft
     *  survives across requests within this process. */
    makeEditorOverlay(editorId: string): Promise<StorageAdapter>;
    private revisionKey;
    /** Preload entries for testing or demo bootstrap. */
    preload(collection: string, entries: Array<{
        id: string;
        data: Record<string, unknown>;
    }>): void;
    discoverCollections(): Promise<string[]>;
    isKnownCollection(collection: string): Promise<boolean>;
    getEntry(collection: string, id: string): Promise<EntryData | null>;
    listEntryIds(collection: string): Promise<string[]>;
    listEntries(collection: string): Promise<EntryData[]>;
    writeEntry(collection: string, id: string, data: Record<string, unknown>): Promise<void>;
    deleteEntry(collection: string, id: string): Promise<void>;
    getRevision(collection: string, id: string): Promise<number>;
    bumpRevision(collection: string, id: string): Promise<number>;
    getHistory(collection: string, id: string): Promise<HistoryEntry[]>;
    appendHistory(collection: string, id: string, entry: HistoryEntry): Promise<void>;
    createCollection(metadata: CollectionMetadata): Promise<void>;
    deleteCollection(collection: string): Promise<void>;
    getCollectionMetadata(collection: string): Promise<CollectionMetadata | null>;
    listCollectionMetadata(): Promise<CollectionMetadata[]>;
}
//# sourceMappingURL=in-memory-adapter.d.ts.map