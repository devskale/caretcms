import type { HistoryEntry, StorageAdapter, PublicationSourceSnapshot, GitJournalReceipt } from "../types.js";
export interface PublishRecovery {
    version: 1;
    beforeRevision: number;
    beforeData: Record<string, unknown> | null;
    afterData: Record<string, unknown> | null;
    beforeSource?: string;
    afterSource?: string;
    journalSources?: PublicationSourceSnapshot[];
    journalReceipt?: GitJournalReceipt;
    history: HistoryEntry & {
        operationId: string;
    };
}
export declare class RecoveryConflict extends Error {
}
export declare function recoveryState(data: Record<string, unknown>): PublishRecovery | null;
export declare function validPublicationSources(value: unknown): value is PublicationSourceSnapshot[];
/** Prepare the entire Markdown file before any source write, preserving untouched YAML. */
export declare function prepareSource(source: string, before: Record<string, unknown> | null, after: Record<string, unknown>, blocks: ReadonlyArray<{
    md: string;
    src: {
        start: number;
        end: number;
        hash: string;
    };
}>): string | null;
/**
 * Forward recovery under the entry lock. The overlay's atomic write persists
 * this plan before touching base content. Each subsequent step is checked so a
 * lost acknowledgement/restart cannot apply the source edit or revision twice.
 * This is recoverability, not atomic visibility or a distributed transaction.
 */
export declare function resumePublish(base: StorageAdapter, overlay: StorageAdapter, collection: string, id: string, plan: PublishRecovery): Promise<number>;
//# sourceMappingURL=publish-recovery.d.ts.map