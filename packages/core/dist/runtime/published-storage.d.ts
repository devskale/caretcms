import type { StorageAdapter } from "../types.js";
export declare function registerPublishedStorage(get: () => Promise<StorageAdapter>): void;
/** The configured storage, or null without a CaretCMS runtime. */
export declare function publishedStorage(): Promise<StorageAdapter | null>;
//# sourceMappingURL=published-storage.d.ts.map