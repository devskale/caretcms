import type { StorageAdapter } from "../types.js";
import { type SnapshotCommitOptions } from "./git-journal.js";
/** Avoid committing an older CMS publication over a newer one in this process. */
export declare function journalPublishedEntries(base: StorageAdapter, versions: ReadonlyArray<{
    collection: string;
    id: string;
    revision: number;
}>, options: SnapshotCommitOptions): Promise<string | null>;
export declare function durableGitJournalEnabled(): boolean;
export declare function hasGitJournalQueue(overlay: StorageAdapter): boolean;
/** Permission preflight is shared by normal publication, explicit retry, and UI state. */
export declare function canRetryPublicationJournals(overlay: StorageAdapter, scope?: {
    collection?: string;
    id?: string;
}): Promise<boolean>;
export interface JournalRetryOutcome {
    completed: number;
    pending: number;
    blocked: number;
    commit: string | null;
}
/** Retry private receipts only; never reapply content, history, or rebuild hooks. */
export declare function retryPublicationJournals(base: StorageAdapter, overlay: StorageAdapter, cwd: string, scope?: {
    collection?: string;
    id?: string;
}): Promise<JournalRetryOutcome>;
//# sourceMappingURL=publication-journal.d.ts.map