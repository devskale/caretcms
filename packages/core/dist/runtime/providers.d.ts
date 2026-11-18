import type { DeploymentStatusProvider, IdentityAdapter, StorageAdapter, UploadHandler } from "../types.js";
type RuntimeServices = {
    adapter: StorageAdapter;
    uploadHandler: UploadHandler;
    identityAdapter: IdentityAdapter | null;
    deploymentStatusProvider: DeploymentStatusProvider | null;
    /** Per-tag class allowlist for rich-text sanitization (from caret() config). */
    allowedClasses: Record<string, string[]>;
    delivery: {
        mode: "server" | "static";
        bake: boolean;
        publish: {
            webhookUrl: string | null;
            timeoutMs?: number;
            method: "POST" | "PUT";
            headers: Record<string, string>;
        };
    };
    /** Whether the inline editor is enabled — gates the authed empty-state hint. */
    enableInlineEditor: boolean;
    /** CMS mount/API base paths, so the empty-state hint skips CMS-owned pages. */
    mountPath: string;
    apiBasePath: string;
};
/** Only the configured storage, for reads outside a request (a static build). */
export declare function getStorageAdapter(): Promise<StorageAdapter>;
export declare function getRuntimeServices(): Promise<RuntimeServices>;
export declare function __setRuntimeServicesForTests(services: Partial<RuntimeServices> | null): void;
export {};
//# sourceMappingURL=providers.d.ts.map