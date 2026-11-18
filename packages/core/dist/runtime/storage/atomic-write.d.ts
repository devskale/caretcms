/**
 * Crash-safe filesystem write primitives shared by every filesystem-backed
 * StorageAdapter and the sidecar metadata store.
 */
/**
 * Write a file atomically: stream into a sibling temp file, then rename over
 * the target. rename(2) is atomic on the same filesystem, so a crash/SIGKILL
 * mid-write can never leave a truncated or empty file — readers always see
 * either the old contents or the complete new contents. The temp file is a
 * sibling (same dir → same filesystem) so the rename stays atomic and never
 * crosses a device boundary.
 */
export declare function atomicWrite(filePath: string, contents: string): Promise<void>;
/**
 * Serialize async tasks that share a `key` so their read-modify-write sequences
 * never interleave. Used for the single shared revisions store, where a torn
 * read-increment-write would lose revision state and defeat optimistic
 * concurrency. Keyed by an arbitrary string (typically a file path); chains are
 * cleaned up once drained so the map can't grow unbounded.
 */
export declare function serializeWrite<T>(key: string, task: () => Promise<T>): Promise<T>;
//# sourceMappingURL=atomic-write.d.ts.map