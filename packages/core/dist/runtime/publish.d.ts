/**
 * Draft publish / discard — flush a per-editor draft overlay into the base store
 * (or throw it away). The overlay is built by `StorageAdapter.makeEditorOverlay`;
 * the base is the shared published store. Each entry is moved under the SAME
 * per-entry lock the mutation engine uses, so a publish serializes against any
 * concurrent save on that entry instead of tearing the data/revision pair.
 */
import type { StorageAdapter, PublicationSourceSnapshot, GitJournalTarget } from "../types.js";
export interface PublishScope {
    /** Limit to one collection (with `id`, to one entry). Omit to publish all. */
    collection?: string;
    /** Limit to one entry; only honored together with `collection`. */
    id?: string;
}
export interface PublishOptions {
    /** Explicit opt-in; captured in the recovery plan before applying content. */
    journal?: {
        target: GitJournalTarget;
        authorName: string;
        authorEmail: string;
    };
}
export interface PublishedEntry {
    collection: string;
    id: string;
    /** New base revision after the flush (0 for a deleted entry). */
    revision: number;
    deleted: boolean;
}
export interface PublishConflict {
    collection: string;
    id: string;
    /** Body hashes, structured baselines, or legacy drafts failed validation.
     * The entry was not published and its draft is preserved. */
    reason: "stale_body" | "invalid_body" | "stale_entry" | "legacy_draft" | "invalid_entry";
}
export interface PublishOutcome {
    published: PublishedEntry[];
    /** Internal journal input; never expose source bytes or filesystem paths in API responses. */
    journalSources: PublicationSourceSnapshot[] | null;
    journalVersions: Array<{
        collection: string;
        id: string;
        revision: number;
    }>;
    conflicts: PublishConflict[];
    failed: Array<{
        collection: string;
        id: string;
        reason: "storage_error" | "recovery_conflict";
    }>;
    /** A source file was rewritten, so build-time renders show it only after a rebuild. */
    sourceChanged: boolean;
}
/** Preflight the entire batch before any source, revision, journal or hook write. */
export declare function canPublishOverlay(overlay: StorageAdapter, scope?: PublishScope): Promise<boolean>;
/**
 * Flush the overlay into the base. A tombstoned draft entry deletes from the
 * base; any other draft entry is written, the base revision bumped, and a
 * `"publish"` history entry (carrying the pre-publish base data) appended. Each
 * published entry is then cleared from the overlay so it stops shadowing the
 * base. Returns the new base revisions so the client can reconcile its cached
 * revision map — without this, the first edit after a publish would 409.
 *
 * NOT atomic across multiple entries (per-entry locks only): on a partial
 * failure the returned list reflects exactly what was committed. Callers that
 * surface "publish all" should report that list.
 */
export declare function publishOverlay(base: StorageAdapter, overlay: StorageAdapter, scope?: PublishScope, options?: PublishOptions): Promise<PublishOutcome>;
/** Discard an editor's draft(s) within scope without touching the base. Returns
 *  the number of overlay entries cleared. */
export declare function discardOverlay(overlay: StorageAdapter, scope?: PublishScope): Promise<number>;
//# sourceMappingURL=publish.d.ts.map