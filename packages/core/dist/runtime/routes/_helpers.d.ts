import type { StorageAdapter, UploadHandler } from "../../types.js";
/**
 * Storage adapter for CMS API/Studio routes. Prefer the middleware ALS scope;
 * fall back to the configured base adapter when injectRoute handlers run
 * outside middleware (seen in Astro static dev after HMR or stale processes).
 */
export declare function resolveAdapter(): Promise<StorageAdapter>;
/**
 * The adapter for Studio and editor reads: it also lists what pages show
 * before anything is saved (page-content.ts). Never for writes.
 */
export declare function resolveReadAdapter(): Promise<StorageAdapter>;
export declare function resolveUploadHandler(): Promise<UploadHandler>;
export declare function json(body: Record<string, unknown>, status?: number): Response;
/** Default cap for JSON command payloads (mutate/history/login). */
export declare const MAX_JSON_BODY_BYTES: number;
/** Default cap for multipart upload bodies before they're buffered. */
export declare const MAX_UPLOAD_BODY_BYTES: number;
/**
 * Reject a request whose declared Content-Length exceeds `maxBytes`. Cheap
 * first line of defense for bodies we must hand to a buffering parser (e.g.
 * formData()): an honest client and most attacks announce their size. Returns
 * a 413 response when over the cap, otherwise null. Absent/garbage
 * Content-Length passes here — pair with a streaming cap where possible.
 */
export declare function enforceContentLength(request: Request, maxBytes: number): Response | null;
type JsonBodyResult = {
    ok: true;
    value: unknown;
} | {
    ok: false;
    response: Response;
};
/**
 * Read and JSON-parse a request body with a hard byte cap, streaming the body
 * and aborting once the running total exceeds `maxBytes` so an attacker can't
 * exhaust memory by omitting Content-Length and sending a chunked flood.
 */
export declare function readJsonBody(request: Request, maxBytes?: number): Promise<JsonBodyResult>;
/** Bound multipart and URL-encoded bodies before handing them to formData(). */
export declare function readFormBody(request: Request, maxBytes: number): Promise<{
    ok: true;
    value: FormData;
} | {
    ok: false;
    response: Response;
}>;
/**
 * Lightweight CSRF defense for mutating endpoints.
 *
 * Cookies use SameSite=Lax, so a cross-origin top-level POST won't carry the
 * session — but a same-origin XSS or any future cross-origin fetch with
 * credentials would. Requiring a custom request header forces a CORS preflight
 * for any cross-origin caller and blocks form-based submissions outright.
 *
 * Returns a 403 response if the header is missing, otherwise null.
 */
export declare function enforceCsrfHeader(request: Request): Response | null;
export declare function getAdapter(): StorageAdapter;
export declare function getUploadHandler(): UploadHandler;
export declare function getSessionId(): string | null;
export {};
//# sourceMappingURL=_helpers.d.ts.map