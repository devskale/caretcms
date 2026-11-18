import type { DeploymentTarget, RebuildReceipt, GitJournalReceipt } from "../../types.js";
import type { CollectionMetadata, EntryData, EntrySnapshot, HistoryEntry, StorageAdapter, PublicationSourceSnapshot } from "../../types.js";
/**
 * Reference StorageAdapter that stores each entry as a JSON file under
 * `.caret/data/<collection>/<id>.json`, delegating all revision, history, and
 * collection-metadata concerns to a shared `SidecarMetaStore` (`.caretcms/`).
 */
export declare class FilesystemAdapter implements StorageAdapter {
    readonly guarantees: Readonly<{
        readonly persistence: "durable";
        readonly snapshots: "process";
        readonly commits: "process";
        readonly collectionDeletion: "content";
    }>;
    private readonly dataRoot;
    private readonly meta;
    private readonly draftsRoot;
    constructor(options?: {
        dataRoot?: string;
        metaRoot?: string;
        draftsRoot?: string;
    });
    getRebuildReceipt(): Promise<RebuildReceipt | null>;
    setRebuildReceipt(receipt: RebuildReceipt | null): Promise<void>;
    getDeploymentTarget(): Promise<DeploymentTarget | null>;
    setDeploymentTarget(target: DeploymentTarget | null): Promise<void>;
    listGitJournalReceipts(): Promise<GitJournalReceipt[]>;
    saveGitJournalReceipt(receipt: GitJournalReceipt): Promise<void>;
    deleteGitJournalReceipt(operationId: string): Promise<void>;
    private collectionDir;
    /** The data root — what git stages for commit-on-publish (a no-op if it's
     *  gitignored, e.g. the default `.caret/data`). */
    committablePath(): string;
    committableEntryPaths(collection: string, id: string): Promise<string[]>;
    preparePublicationSources(collection: string, id: string, data: Record<string, unknown> | null): Promise<PublicationSourceSnapshot[]>;
    /** A persistent draft overlay for one editor, as a sibling JSON store under
     *  `<.caret>/drafts/<editorId>/`. Same id → same on-disk store. */
    makeEditorOverlay(editorId: string): Promise<StorageAdapter>;
    makeRecoveryOverlay(editorId: string, purpose: "source-restore"): Promise<StorageAdapter>;
    discoverCollections(): Promise<string[]>;
    isKnownCollection(collection: string): Promise<boolean>;
    getEntry(collection: string, id: string): Promise<EntryData | null>;
    listEntryIds(collection: string): Promise<string[]>;
    listEntries(collection: string): Promise<EntryData[]>;
    /** Called under the runtime's entry locks; arbitrary file editors remain outside that scope. */
    getEntrySnapshots(collection: string, ids: readonly string[]): Promise<EntrySnapshot[]>;
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
//# sourceMappingURL=filesystem-adapter.d.ts.map