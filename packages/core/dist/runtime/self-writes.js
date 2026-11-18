import { resolve } from "node:path";
/**
 * Files CaretCMS wrote itself, so the dev server can tell an editor's save
 * from a developer's edit. Kept on `globalThis` because Astro evaluates the
 * runtime (which writes) separately from the integration (which serves dev).
 */
const REGISTRY = Symbol.for("caretcms.selfWrites");
const WINDOW_MS = 5_000;
function registry() {
    const scope = globalThis;
    return (scope[REGISTRY] ??= new Map());
}
export function recordSelfWrite(path) {
    const writes = registry();
    const now = Date.now();
    for (const [file, at] of writes)
        if (now - at > WINDOW_MS)
            writes.delete(file);
    writes.set(resolve(path), now);
}
export function isSelfWrite(path) {
    return selfWriteTime(path) !== null;
}
/** When CaretCMS last wrote `path`, if within the window. */
export function selfWriteTime(path) {
    const at = registry().get(resolve(path));
    return at !== undefined && Date.now() - at <= WINDOW_MS ? at : null;
}
const RELOAD_WAITERS = Symbol.for("caretcms.selfWriteReloadWaiters");
function reloadWaiters() {
    const scope = globalThis;
    return (scope[RELOAD_WAITERS] ??= new Set());
}
/**
 * Dev only: resolves once Astro has picked up a write CaretCMS made after
 * this call (the moment it would reload the page), or after `timeoutMs`.
 * Earlier writes (a draft stored just before) don't count. Publishing waits on
 * this so the editor's reload shows the published content, not the old one.
 * Call before writing, so the signal can't arrive first.
 */
export function waitForSelfWriteReload(timeoutMs) {
    const since = Date.now();
    return new Promise(done => {
        const waiters = reloadWaiters();
        const finish = () => { clearTimeout(timer); waiters.delete(onReload); done(); };
        const onReload = writtenAt => { if (writtenAt > since)
            finish(); };
        const timer = setTimeout(finish, timeoutMs);
        waiters.add(onReload);
    });
}
/** Called by the dev server when it skips a reload caused by CaretCMS's
 * writes; `writtenAt` is the newest of those writes. */
export function notifySelfWriteReload(writtenAt) {
    for (const onReload of [...reloadWaiters()])
        onReload(writtenAt);
}
//# sourceMappingURL=self-writes.js.map