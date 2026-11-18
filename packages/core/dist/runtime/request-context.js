import { AsyncLocalStorage } from "node:async_hooks";
// Vite may evaluate more than one copy of @caretcms/core during Astro dev
// dependency optimization. Keep the request scope on the process global so the
// middleware and live loader still share one AsyncLocalStorage instance.
const requestContextKey = Symbol.for("@caretcms/core/request-context");
const globalSlots = globalThis;
const storage = (globalSlots[requestContextKey] ??=
    new AsyncLocalStorage());
export function runWithRequestContext(context, fn) {
    return storage.run(context, fn);
}
export function getRequestContext() {
    return storage.getStore();
}
export function requireRequestContext() {
    const ctx = storage.getStore();
    if (!ctx) {
        throw new Error("[caretcms] No live request context found. Ensure the CMS middleware runs before page rendering (it registers with order: 'pre').");
    }
    return ctx;
}
//# sourceMappingURL=request-context.js.map