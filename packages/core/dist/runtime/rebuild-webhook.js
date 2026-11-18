export async function triggerRebuildWebhook(config, payload) {
    const webhookUrl = config.webhookUrl?.trim();
    if (!webhookUrl)
        return { triggered: false, ok: true };
    const controller = new AbortController();
    const timeout = Number.isFinite(config.timeoutMs) ? Math.max(1, Math.min(config.timeoutMs, 30_000)) : 5_000;
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(webhookUrl, {
            signal: controller.signal,
            method: config.method ?? "POST",
            headers: {
                "content-type": "application/json",
                ...(config.headers ?? {}),
            },
            body: JSON.stringify({
                source: "caretcms",
                event: "publish",
                published: payload.published,
                commit: payload.commit,
                ...(payload.deploymentId ? { deploymentId: payload.deploymentId } : {}),
            }),
        });
        // Only acknowledgement headers matter; don't leave a streaming response open.
        void response.body?.cancel().catch(() => { });
        if (!response.ok) {
            return {
                triggered: true,
                ok: false,
                status: response.status,
                error: `Rebuild webhook failed with status ${response.status}`,
            };
        }
        return { triggered: true, ok: true, status: response.status };
    }
    catch {
        return {
            triggered: true,
            ok: false,
            error: controller.signal.aborted ? "Rebuild webhook timed out" : "Could not reach rebuild webhook",
        };
    }
    finally {
        clearTimeout(timer);
    }
}
//# sourceMappingURL=rebuild-webhook.js.map