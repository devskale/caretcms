/**
 * Runtime guard shared by every filesystem-backed StorageAdapter. Filesystem
 * storage cannot work on edge runtimes (no fs); failing fast in the adapter
 * constructor turns silently-empty reads and cryptic write errors into one
 * actionable message.
 */
export declare function assertFilesystemRuntime(): void;
//# sourceMappingURL=fs-runtime.d.ts.map