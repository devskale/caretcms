export declare function recordSelfWrite(path: string): void;
export declare function isSelfWrite(path: string): boolean;
/** When CaretCMS last wrote `path`, if within the window. */
export declare function selfWriteTime(path: string): number | null;
/**
 * Dev only: resolves once Astro has picked up a write CaretCMS made after
 * this call (the moment it would reload the page), or after `timeoutMs`.
 * Earlier writes (a draft stored just before) don't count. Publishing waits on
 * this so the editor's reload shows the published content, not the old one.
 * Call before writing, so the signal can't arrive first.
 */
export declare function waitForSelfWriteReload(timeoutMs: number): Promise<void>;
/** Called by the dev server when it skips a reload caused by CaretCMS's
 * writes; `writtenAt` is the newest of those writes. */
export declare function notifySelfWriteReload(writtenAt: number): void;
//# sourceMappingURL=self-writes.d.ts.map