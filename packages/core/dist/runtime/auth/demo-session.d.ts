type CookieBag = {
    cookies?: {
        get: (name: string) => {
            value: string;
        } | undefined;
    };
};
/**
 * Detect demo mode from any available env source. Workers populate env via
 * `context.locals.runtime.env` (Astro Cloudflare adapter); Node hosts use
 * `process.env`. Pass `runtimeEnv` when available — falls back to process.env.
 */
export declare function isDemoModeEnabled(runtimeEnv?: Record<string, unknown> | null): boolean;
export interface DemoSessionResolution {
    sessionId: string;
    setCookieHeader: string;
}
/**
 * Read the demo session cookie or mint a new one. Always refreshes the TTL,
 * giving us a sliding 2h window per active visitor.
 */
export declare function resolveDemoSession(context: CookieBag, request: Request): DemoSessionResolution;
export {};
//# sourceMappingURL=demo-session.d.ts.map