import { getRequestContext } from "./request-context.js";
import { SessionOverlayAdapter } from "./storage/session-overlay-adapter.js";
import { stripBodyOverlay } from "./utils.js";
import { loadPageContent, merged } from "./page-content.js";
import { PUBLISH_RECOVERY_KEY } from "./draft-state.js";
/** JSON with object keys sorted, so equal content compares equal. */
function stableJson(value) {
    if (Array.isArray(value))
        return `[${value.map(stableJson).join(",")}]`;
    if (value && typeof value === "object") {
        return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
    }
    return JSON.stringify(value) ?? "null";
}
/** The current request's editor drafts, when it works on drafts (not a demo sandbox). */
function draftScope() {
    const context = getRequestContext();
    if (!context?.overlayActive || context.demoMode || !context.publishedAdapter)
        return null;
    if (!(context.adapter instanceof SessionOverlayAdapter))
        return null;
    return { drafts: context.adapter, published: context.publishedAdapter };
}
/** What the page shows for an entry: its stored data, with the page's own text where nothing is stored. */
function shownData(entry, id, seed) {
    const shown = merged(entry, id, seed);
    return shown ? stableJson(stripBodyOverlay(shown.data)) : null;
}
/**
 * Whether one entry's draft would change what visitors see: edited, new,
 * deleted, or with body-block drafts. A draft edited back to the published
 * content is no change, nor is one that only stores the text the page shows
 * anyway (an edit undone on an entry nothing was saved for yet).
 */
async function draftChange(drafts, published, collection, id, seed) {
    const [draft, stored] = await Promise.all([drafts.getEntry(collection, id), published.getEntry(collection, id)]);
    if (!draft)
        return stored ? { collection, id, deleted: true } : null;
    const body = draft.data.__body;
    const hasBodyDrafts = Boolean(body && typeof body === "object" && Object.keys(body).length > 0);
    const live = shownData(stored, id, seed);
    return !live || hasBodyDrafts || shownData(draft, id, seed) !== live ? { collection, id, deleted: false } : null;
}
/** Entries in one collection whose draft differs from what visitors see (see `draftChange`). */
export async function unpublishedEntries(collection) {
    const scope = draftScope();
    if (!scope)
        return [];
    const seeds = (await loadPageContent())[collection] ?? {};
    const changes = await Promise.all((await scope.drafts.draftIds(collection))
        .map((id) => draftChange(scope.drafts, scope.published, collection, id, seeds[id])));
    return changes.filter((change) => change !== null);
}
/**
 * How many entries in an editor's draft store still need publishing: drafts
 * that change what visitors see, and drafts holding an unfinished publish.
 */
export async function countPendingDrafts(base, overlay) {
    const drafts = new SessionOverlayAdapter(base, overlay);
    const content = await loadPageContent();
    let count = 0;
    for (const collection of await overlay.discoverCollections()) {
        for (const id of await overlay.listEntryIds(collection)) {
            const raw = await overlay.getEntry(collection, id);
            if (raw?.data[PUBLISH_RECOVERY_KEY] || await draftChange(drafts, base, collection, id, content[collection]?.[id]))
                count += 1;
        }
    }
    return count;
}
/** Every entry the current editor has not published yet, across collections. */
export async function allUnpublishedEntries() {
    const scope = draftScope();
    if (!scope)
        return [];
    const collections = await scope.drafts.draftCollections();
    return (await Promise.all(collections.map(unpublishedEntries))).flat();
}
/** Whether the current request works on drafts that need publishing. */
export function worksOnDrafts() {
    return draftScope() !== null;
}
//# sourceMappingURL=unpublished.js.map