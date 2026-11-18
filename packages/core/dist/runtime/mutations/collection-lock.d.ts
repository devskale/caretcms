/** Non-reentrant. Acquire shared collections in a stable order before entry locks. */
export declare function withCollectionReads<T>(collections: readonly string[], task: () => Promise<T>): Promise<T>;
export declare function withCollectionWrite<T>(collection: string, task: () => Promise<T>): Promise<T>;
//# sourceMappingURL=collection-lock.d.ts.map