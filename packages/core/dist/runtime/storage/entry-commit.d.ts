import type { EntryCommit, EntryCommitResult, HistoryEntry, StorageAdapter } from "../../types.js";
export declare function historyForEditor(entry: HistoryEntry): HistoryEntry;
/**
 * Use a distributed adapter's atomic primitive when available. The fallback is
 * intended for adapters protected by the mutation engine's in-process locks.
 */
export declare function commitEntryChanges(adapter: StorageAdapter, changes: readonly EntryCommit[]): Promise<EntryCommitResult>;
//# sourceMappingURL=entry-commit.d.ts.map