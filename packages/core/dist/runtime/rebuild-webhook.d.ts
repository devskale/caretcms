export interface RebuildWebhookConfig {
    webhookUrl: string | null;
    method?: "POST" | "PUT";
    headers?: Record<string, string>;
    /** Defaults to 5 seconds, bounded to 30 seconds. */
    timeoutMs?: number;
}
export interface RebuildWebhookPayload {
    published: Array<{
        collection: string;
        id: string;
        revision: number;
        deleted: boolean;
    }>;
    commit: string | null;
    /** Correlates this request with deployment status provider results. */
    deploymentId?: string;
}
export type RebuildWebhookResult = {
    triggered: false;
    ok: true;
} | {
    triggered: true;
    ok: true;
    status: number;
} | {
    triggered: true;
    ok: false;
    status?: number;
    error: string;
};
export declare function triggerRebuildWebhook(config: RebuildWebhookConfig, payload: RebuildWebhookPayload): Promise<RebuildWebhookResult>;
//# sourceMappingURL=rebuild-webhook.d.ts.map