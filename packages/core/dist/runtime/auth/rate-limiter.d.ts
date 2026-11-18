/**
 * Sliding-window failure counter for login attempts. Holds state in-process,
 * so single-Node deployments get a meaningful brute-force defense out of the
 * box. Multi-instance or Workers deployments should layer Durable Objects or
 * a WAF rate-limit rule on top — there's no shared state here.
 */
export type RateLimitResult = {
    allowed: true;
} | {
    allowed: false;
    retryAfterSeconds: number;
};
export declare function checkLoginRateLimit(key: string, options?: {
    maxFailures?: number;
    windowMs?: number;
    now?: number;
}): RateLimitResult;
export declare function recordLoginFailure(key: string, options?: {
    windowMs?: number;
    now?: number;
}): void;
export declare function clearLoginAttempts(key: string): void;
/** Test-only. Resets all counters. */
export declare function __resetLoginRateLimiter(): void;
export declare function extractRateLimitKey(request: Request): string;
//# sourceMappingURL=rate-limiter.d.ts.map