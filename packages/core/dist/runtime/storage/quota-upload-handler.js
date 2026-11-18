import { UploadError } from "./image-validation.js";
/**
 * Decorates an UploadHandler with per-session size limits. Reads the running
 * session usage from the supplied counter, rejects oversized files, and
 * persists the new total after each successful upload.
 */
export class QuotaUploadHandler {
    inner;
    counter;
    perSessionBytes;
    perFileBytes;
    // Per-session promise chain so the read→check→upload→write sequence runs
    // atomically and two concurrent uploads can't both read the same `used`,
    // both pass the check, and overshoot the cap (last-writer-wins under-count).
    // NOTE: in-process only — it serializes within a single Node process / Worker
    // isolate, not across a distributed fleet. Good enough for a sandbox soft
    // limit; a hard cross-isolate cap would need an atomic counter (e.g. a
    // Durable Object).
    sessionChains = new Map();
    constructor(options) {
        this.inner = options.inner;
        this.counter = options.counter;
        this.perSessionBytes = options.perSessionBytes ?? 25 * 1024 * 1024;
        this.perFileBytes = options.perFileBytes ?? 5 * 1024 * 1024;
    }
    withSessionLock(sessionId, task) {
        const previous = this.sessionChains.get(sessionId) ?? Promise.resolve();
        const next = previous.then(task, task);
        // Store a rejection-safe tail for chaining: a rejected upload (e.g. quota
        // exceeded) is observed by the caller via `next`, but the *stored* promise
        // must never reject or it surfaces as an unhandled rejection.
        const tail = next.then(() => { }, () => { }).finally(() => {
            if (this.sessionChains.get(sessionId) === tail) {
                this.sessionChains.delete(sessionId);
            }
        });
        this.sessionChains.set(sessionId, tail);
        return next;
    }
    async upload(file, ctx) {
        if (!ctx?.sessionId) {
            return this.inner.upload(file, ctx);
        }
        const sessionId = ctx.sessionId;
        if (file.size > this.perFileBytes) {
            const limitMb = Math.floor(this.perFileBytes / (1024 * 1024));
            throw new UploadError(`This image is larger than ${limitMb} MB, the limit in this demo. Use a smaller image.`);
        }
        return this.withSessionLock(sessionId, async () => {
            const used = await this.counter.read(sessionId);
            if (used + file.size > this.perSessionBytes) {
                throw new UploadError("This demo has no room for more images. Close this tab to start a fresh session.");
            }
            const result = await this.inner.upload(file, ctx);
            await this.counter.write(sessionId, used + file.size);
            return result;
        });
    }
}
//# sourceMappingURL=quota-upload-handler.js.map