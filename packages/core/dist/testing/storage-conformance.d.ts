import type { StorageAdapter } from "../types.js";
export interface StorageConformanceFixture {
    /** A fresh, empty, private store. Never use production content. */
    adapter: StorageAdapter;
    /** Another client for the same store; enables concurrent transaction checks. */
    reopen?(): Promise<StorageAdapter>;
    /** Wait for single-writer visibility on eventually consistent stores. */
    settle?(): Promise<void>;
    dispose?(): Promise<void>;
}
export interface StorageConformanceResult {
    name: string;
    status: "passed" | "failed" | "skipped";
    message?: string;
}
/**
 * Destructive behavioral checks for a fresh adapter fixture per test. No test
 * framework dependency. Skips are explicit and do not certify untested claims.
 * Fault injection, restart durability, expiry, and real platform isolation need
 * additional provider-specific tests.
 */
export declare function runStorageConformance(createFixture: (name: string) => Promise<StorageConformanceFixture>): Promise<StorageConformanceResult[]>;
//# sourceMappingURL=storage-conformance.d.ts.map