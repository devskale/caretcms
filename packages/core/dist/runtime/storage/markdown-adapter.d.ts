import type { CollectionMetadata, EntryData, EntrySnapshot, HistoryEntry, StorageAdapter, PublicationSourceSnapshot } from "../../types.js";
/**
 * StorageAdapter over Astro file-based content collections.
 *
 * Maps `<contentRoot>/<collection>/<id>.{md,mdx}` to entries: YAML frontmatter
 * becomes the entry `data`, and edits are written back IN-PLACE — the markdown
 * body (everything after the closing `---`, including MDX JSX/imports) is
 * spliced through byte-for-byte. Body block drafts publish through prepared,
 * hash-checked source replacements, with sidecar recovery metadata.
 *
 * A collection with no Markdown directory may instead be an Astro `file()`
 * data file: the JSON file its `file("…")` loader names in the project's
 * content config (wherever it lives, e.g. `src/data/menu.json`), or else
 * `<contentRoot>/<collection>.json`. A `file()` file is an array of objects
 * with `id` or an object keyed by id. Its entries are read and written in
 * place inside that one file; see `data-file-codec.ts`.
 *
 * Revisions, history, and collection metadata live in the `.caretcms/` sidecar
 * (shared `SidecarMetaStore`), so the source `.md` files stay free of CMS state.
 *
 * v1 boundaries (intentional):
 *  - Flat collection directories only (no nested-slug subdirectories).
 *  - Filenames whose stem fails the entry-id contract are ignored.
 *  - `deleteCollection` never deletes source content — only sidecar state.
 *  - `makeSessionOverlay` is intentionally not implemented: ephemeral demo
 *    overlays make no sense for a source-file-backed adapter. `makeEditorOverlay`
 *    (persistent drafts) IS supported — it delegates to a JSON-backed
 *    `FilesystemAdapter` under `.caret/drafts/`, so the source `.md` files stay
 *    pristine until an explicit Publish flushes a draft back in.
 */
export declare class MarkdownAdapter implements StorageAdapter {
    readonly guarantees: Readonly<{
        readonly persistence: "durable";
        readonly snapshots: "process";
        readonly commits: "process";
        readonly collectionDeletion: "metadata";
    }>;
    getEntrySnapshots(collection: string, ids: readonly string[]): Promise<EntrySnapshot[]>;
    private readonly contentRoot;
    private readonly projectRoot;
    private readonly meta;
    private readonly draftsRoot;
    constructor(options?: {
        contentRoot?: string;
        metaRoot?: string;
        draftsRoot?: string;
        projectRoot?: string;
    });
    /** A persistent draft overlay for one editor. Drafts are JSON-backed (a
     *  `FilesystemAdapter`) so editing a markdown collection's frontmatter never
     *  touches the source `.md` until Publish. Same id → same on-disk store. */
    makeEditorOverlay(editorId: string): Promise<StorageAdapter>;
    makeRecoveryOverlay(editorId: string, purpose: "source-restore"): Promise<StorageAdapter>;
    private collectionDir;
    /** JSON files the content config's `file()` loaders name, by collection. */
    private configuredDataFiles;
    private dataFilePath;
    private readDataFile;
    /** Markdown documents unless the collection exists only as a data file. */
    isDocumentCollection(collection: string): Promise<boolean>;
    /** The collection's data file, when it is a data collection. */
    private dataCollection;
    /** The content root — what git stages for commit-on-publish. */
    committablePath(): string;
    committableEntryPaths(collection: string, id: string, deleted: boolean): Promise<string[]>;
    preparePublicationSources(collection: string, id: string, data: Record<string, unknown> | null, preparedSource?: string): Promise<PublicationSourceSnapshot[]>;
    /** First existing `<id>.{md,mdx}` path for an entry, honoring .md precedence. */
    private resolveEntryPath;
    discoverCollections(): Promise<string[]>;
    private listDataFileCollections;
    isKnownCollection(collection: string): Promise<boolean>;
    /** Raw source file (frontmatter + body) for body-editing hash checks/splices. */
    readBodySource(collection: string, id: string): Promise<string | null>;
    /** Publish-time body flush: verify + apply drafted block edits to the source
     *  file, all-or-nothing (`markdown/splice.ts`). File untouched on failure. */
    spliceBodyBlocks(collection: string, id: string, blocks: ReadonlyArray<{
        md: string;
        src: {
            start: number;
            end: number;
            hash: string;
        };
    }>): Promise<{
        ok: true;
    } | {
        ok: false;
        reason: "stale" | "overlap" | "missing";
    }>;
    /** Restore an entry's full source file (history `bodySource` snapshots). */
    writeBodySource(collection: string, id: string, source: string): Promise<void>;
    getEntry(collection: string, id: string): Promise<EntryData | null>;
    listEntryIds(collection: string): Promise<string[]>;
    private listDocumentIds;
    listEntries(collection: string): Promise<EntryData[]>;
    writeEntry(collection: string, id: string, data: Record<string, unknown>): Promise<void>;
    deleteEntry(collection: string, id: string): Promise<void>;
    getRevision(collection: string, id: string): Promise<number>;
    bumpRevision(collection: string, id: string): Promise<number>;
    getHistory(collection: string, id: string): Promise<HistoryEntry[]>;
    appendHistory(collection: string, id: string, entry: HistoryEntry): Promise<void>;
    /** Sidecar metadata only — the content directory is owned by the project. */
    createCollection(metadata: CollectionMetadata): Promise<void>;
    /**
     * Removes only sidecar state (metadata + history). It deliberately does NOT
     * delete `src/content/<collection>/` — destroying version-controlled source
     * content through a CMS runtime call is never acceptable.
     */
    deleteCollection(collection: string): Promise<void>;
    getCollectionMetadata(collection: string): Promise<CollectionMetadata | null>;
    listCollectionMetadata(): Promise<CollectionMetadata[]>;
}
//# sourceMappingURL=markdown-adapter.d.ts.map