import { shouldUseSecureCookies } from "./cookie-utils.js";
const COOKIE_NAME = "caret_demo_session";
const TTL_SECONDS = 60 * 60 * 2; // 2h sliding window
const ID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
function serialize(value, maxAge, request) {
    const parts = [
        `${COOKIE_NAME}=${value}`,
        "Path=/",
        "HttpOnly",
        "SameSite=Lax",
        `Max-Age=${maxAge}`,
    ];
    if (shouldUseSecureCookies(request))
        parts.push("Secure");
    return parts.join("; ");
}
/**
 * Detect demo mode from any available env source. Workers populate env via
 * `context.locals.runtime.env` (Astro Cloudflare adapter); Node hosts use
 * `process.env`. Pass `runtimeEnv` when available — falls back to process.env.
 */
export function isDemoModeEnabled(runtimeEnv) {
    if (runtimeEnv && runtimeEnv.CARET_DEMO_MODE === "true")
        return true;
    if (typeof process !== "undefined" && process.env?.CARET_DEMO_MODE === "true") {
        return true;
    }
    return false;
}
/**
 * Read the demo session cookie or mint a new one. Always refreshes the TTL,
 * giving us a sliding 2h window per active visitor.
 */
export function resolveDemoSession(context, request) {
    const existing = context.cookies?.get(COOKIE_NAME)?.value;
    const sessionId = existing && ID_PATTERN.test(existing) ? existing : crypto.randomUUID();
    return {
        sessionId,
        setCookieHeader: serialize(sessionId, TTL_SECONDS, request),
    };
}
//# sourceMappingURL=demo-session.js.map