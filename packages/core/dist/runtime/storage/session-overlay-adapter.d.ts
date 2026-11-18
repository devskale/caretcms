import type { CollectionMetadata, EntryCommit, EntryCommitResult, EntryData, EntrySnapshot, HistoryEntry, DeploymentTarget, RebuildReceipt, StorageAdapter, StorageGuarantees } from "../../types.js";
/** Sentinel marking a deleted-in-overlay entry. Exported so the publish flow can
 *  recognize a draft deletion and apply it to the base as a real delete. */
export declare const TOMBSTONE_KEY = "__caret_tombstone__";
/**
 * Overlay adapter for demo / multi-tenant sandbox use. Reads check the overlay
 * first and fall back to the shared base adapter; writes go only to the overlay.
 *
 * Structured editor drafts retain a full snapshot and the first published base
 * for conflict detection. Body-only drafts and demo overlays merge over base.
 *
 * Deletes write a tombstone sentinel into the overlay rather than removing the
 * overlay key, so deleting a base-only entry stays deleted for the session
 * instead of falling through to the seeded value on the next read.
 */
export declare class SessionOverlayAdapter implements StorageAdapter {
    private readonly base;
    private readonly overlay;
    private readonly trackDrafts;
    private readonly coordinator;
    /** Separate stores remain weaker unless the adapter supplies a bound coordinator. */
    get guarantees(): Readonly<StorageGuarantees> | undefined;
    constructor(base: StorageAdapter, overlay: StorageAdapter, trackDrafts?: boolean);
    getRebuildReceipt(): Promise<RebuildReceipt | null>;
    setRebuildReceipt(receipt: RebuildReceipt | null): Promise<void>;
    getDeploymentTarget(): Promise<DeploymentTarget | null>;
    setDeploymentTarget(target: DeploymentTarget | null): Promise<void>;
    discoverCollections(): Promise<string[]>;
    isKnownCollection(collection: string): Promise<boolean>;
    getEntry(collection: string, id: string): Promise<EntryData | null>;
    getEntrySnapshot(collection: string, id: string): Promise<EntrySnapshot>;
    getEntrySnapshots(collection: string, ids: readonly string[]): Promise<EntrySnapshot[]>;
    /** The overlay's OWN entry (draft deltas only), with no base fallback or
     *  merge. The md_block mutation reads this so a body draft writes back just
     *  its delta plus `__body` — never a base frontmatter snapshot that a later
     *  publish would flush over fields edited straight to base in the meantime. */
    getOwnEntry(collection: string, id: string): Promise<EntryData | null>;
    /** Ids this session holds its own copy of (edited or deleted), whether or not it still differs from base. */
    draftIds(collection: string): Promise<string[]>;
    /** Collections this session holds its own copies in. */
    draftCollections(): Promise<string[]>;
    listEntryIds(collection: string): Promise<string[]>;
    listEntries(collection: string): Promise<EntryData[]>;
    writeEntry(collection: string, id: string, data: Record<string, unknown>): Promise<void>;
    writeBodyDraft(collection: string, id: string, data: Record<string, unknown>): Promise<void>;
    private writeDraft;
    deleteEntry(collection: string, id: string): Promise<void>;
    getRevision(collection: string, id: string): Promise<number>;
    bumpRevision(collection: string, id: string): Promise<number>;
    getHistory(collection: string, id: string): Promise<HistoryEntry[]>;
    appendHistory(collection: string, id: string, entry: HistoryEntry): Promise<void>;
    commitEntries(changes: readonly EntryCommit[]): Promise<EntryCommitResult>;
    /** Body source always comes from the BASE — drafts shadow entry data, never
     *  the published `.md` file (the splice happens at publish, not draft, time). */
    readBodySource(collection: string, id: string): Promise<string | null>;
    isDocumentCollection(collection: string): Promise<boolean>;
    createCollection(metadata: CollectionMetadata): Promise<void>;
    deleteCollection(collection: string): Promise<void>;
    getCollectionMetadata(collection: string): Promise<CollectionMetadata | null>;
    listCollectionMetadata(): Promise<CollectionMetadata[]>;
}
//# sourceMappingURL=session-overlay-adapter.d.ts.map