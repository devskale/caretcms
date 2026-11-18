import type { StorageAdapter } from "../../types.js";
import { type MutationIssue } from "./contracts.js";
/** Request-scoped extras a route can thread into `executeMutation`. */
export interface MutationOptions {
    /** Per-tag class allowlist for the md_block HTML re-sanitize. */
    allowedClasses?: Record<string, string[]>;
}
/** Separate lock namespace for an editor's publish requests and deploy receipts. */
export declare function withEditorPublishLock<T>(editorId: string, task: () => Promise<T>): Promise<T>;
/**
 * Run `task` while holding the same per-entry lock the mutation engine uses,
 * so an out-of-band write (e.g. a history restore) is serialized against any
 * concurrent save_field/put_entry on the same entry instead of interleaving
 * and tearing the data/revision pair.
 */
export declare function withEntryLock<T>(collection: string, id: string, task: () => Promise<T>): Promise<T>;
/** Hold a sorted set of entry locks through a coordinated read/journal operation. */
export declare function withEntryLocks<T>(entries: ReadonlyArray<{
    collection: string;
    id: string;
}>, task: () => Promise<T>): Promise<T>;
type MutationErrorBody = {
    error: string;
    issues?: MutationIssue[];
    currentRevision?: number;
    currentBaseRevision?: number;
    conflictId?: string;
};
type MutationResult = {
    ok: true;
    body: {
        ok: true;
        revision?: number;
        revisions?: Record<string, number>;
    };
} | {
    ok: false;
    status: number;
    body: MutationErrorBody;
};
export declare function executeMutation(adapter: StorageAdapter, input: unknown, options?: MutationOptions): Promise<MutationResult>;
export {};
//# sourceMappingURL=engine.d.ts.map