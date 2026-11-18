import type { DeploymentTarget, RebuildReceipt, GitJournalReceipt } from "../../types.js";
import type { CollectionMetadata, HistoryEntry } from "../../types.js";
/** Directory names under `dir` that are valid collection names. */
export declare function listCollectionDirs(dir: string): Promise<string[]>;
/**
 * Owns all `.caretcms/` sidecar I/O — the single shared revisions map, per-entry
 * history files, and collection-metadata JSON. It knows nothing about how the
 * entries themselves are stored, so any filesystem-backed StorageAdapter (JSON
 * blobs, markdown files, …) can compose it for its revision/history/collection-
 * metadata concerns rather than reimplementing this safety-critical logic.
 *
 * Crash-safe via `atomicWrite`; the revisions store is additionally serialized
 * per-path via `serializeWrite` so concurrent `bumpRevision` calls never tear
 * the read-increment-write sequence.
 */
export declare class SidecarMetaStore {
    private readonly metaRoot;
    constructor(options: {
        metaRoot: string;
    });
    getRebuildReceipt(): Promise<RebuildReceipt | null>;
    setRebuildReceipt(receipt: RebuildReceipt | null): Promise<void>;
    getDeploymentTarget(): Promise<DeploymentTarget | null>;
    setDeploymentTarget(target: DeploymentTarget | null): Promise<void>;
    private journalPath;
    listGitJournalReceipts(): Promise<GitJournalReceipt[]>;
    saveGitJournalReceipt(receipt: GitJournalReceipt): Promise<void>;
    deleteGitJournalReceipt(operationId: string): Promise<void>;
    private revisionStorePath;
    private revisionMapKey;
    private historyFilePath;
    private collectionsMetaDir;
    private collectionMetaPath;
    private readRevisionMap;
    private writeRevisionMap;
    getRevision(collection: string, id: string): Promise<number>;
    getRevisions(collection: string, ids: readonly string[]): Promise<number[]>;
    bumpRevision(collection: string, id: string): Promise<number>;
    /** Invalidate a deleted collection in one atomic revision-map replacement. */
    bumpRevisions(collection: string, ids: readonly string[]): Promise<void>;
    private readHistoryFile;
    private writeHistoryFile;
    getHistory(collection: string, id: string): Promise<HistoryEntry[]>;
    appendHistory(collection: string, id: string, entry: HistoryEntry): Promise<void>;
    /** Collection names that have sidecar history recorded. */
    listHistoryCollections(): Promise<string[]>;
    /**
     * Persist a collection's metadata JSON. Sidecar-only: this never creates an
     * entry-storage directory — that is the concrete adapter's concern (and for
     * source-backed adapters, the directory is owned by the project, not the CMS).
     */
    createCollection(metadata: CollectionMetadata): Promise<void>;
    /**
     * Remove a collection's sidecar state (metadata JSON + history). It does NOT
     * touch entry storage — the concrete adapter decides whether deleting a
     * collection should remove its entries (the JSON adapter does; a source-file
     * adapter must not destroy version-controlled content).
     */
    deleteCollection(collection: string): Promise<void>;
    getCollectionMetadata(collection: string): Promise<CollectionMetadata | null>;
    listCollectionMetadata(): Promise<CollectionMetadata[]>;
}
//# sourceMappingURL=sidecar-meta-store.d.ts.map