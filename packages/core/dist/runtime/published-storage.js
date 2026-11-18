/**
 * The configured storage for reads outside a request (a static build). The
 * providers module registers it when it loads, so code that only may need it
 * (`editable()`, exported from the package root) never imports the virtual
 * providers module itself: a worker that bundles the root for another export
 * would fail to resolve it. Shared across module copies, like the request
 * context.
 */
const key = Symbol.for("@caretcms/core/published-storage");
const slots = globalThis;
export function registerPublishedStorage(get) {
    slots[key] = get;
}
/** The configured storage, or null without a CaretCMS runtime. */
export async function publishedStorage() {
    const get = slots[key];
    if (!get)
        return null;
    try {
        return await get();
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=published-storage.js.map