export const prerender = false;
import { loadPageContent, withPageContent } from "../page-content.js";
import { matchEntry } from "../entry-search.js";
import { canPerform } from "../authorization.js";
import { unpublishedEntries } from "../unpublished.js";
import { entryDisplayTitle } from "../entry-title.js";
import { isEditorAuthenticated } from "../auth/session.js";
import { parseCollectionName, parseEntryId } from "../mutations/contracts.js";
import { stripBodyOverlay } from "../utils.js";
import { getRegisteredSchema, resolveCollectionStudioConfig } from "../schema-registry.js";
import { validateJsonSchema } from "../../schema-utils.js";
import { contentReadFailure } from "../content-errors.js";
import { json, resolveReadAdapter } from "./_helpers.js";
import { getRequestContext } from "../request-context.js";
import { readEntrySnapshot, readEntrySnapshots } from "../storage/read-snapshot.js";
/**
 * Arranged order, as Save order writes it and sites read it: a numeric
 * `order` ascending, entries without one last, ties by id.
 */
function compareArrangedOrder(a, b) {
    const aOrder = typeof a.data.order === "number" ? a.data.order : Number.MAX_SAFE_INTEGER;
    const bOrder = typeof b.data.order === "number" ? b.data.order : Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder || a.id.localeCompare(b.id);
}
function withValidation(collection, entry, revision, baseRevision) {
    const data = stripBodyOverlay(entry.data);
    const schema = getRegisteredSchema(collection)?.schema;
    const validationIssues = schema ? validateJsonSchema(data, schema) : [];
    return {
        id: entry.id,
        data,
        revision,
        ...(baseRevision !== undefined ? { baseRevision } : {}),
        ...(validationIssues.length > 0 ? { validationIssues } : {}),
    };
}
function asPositiveInt(value, fallback) {
    if (!value)
        return fallback;
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0)
        return fallback;
    return parsed;
}
async function parseQuery(context) {
    const url = new URL(context.request.url);
    // Validate the collection name's format only — a well-formed but not-yet-
    // created collection is legitimate (the editor reads an entry's revision
    // before its very first write, which auto-creates the collection). Gating on
    // existence here would 400 that read and silently abort the first save.
    const rawCollection = parseCollectionName(url.searchParams.get("collection"));
    if (!rawCollection)
        return null;
    const rawIdValue = url.searchParams.get("id");
    const id = rawIdValue && rawIdValue.trim().length > 0 ? parseEntryId(rawIdValue) : undefined;
    if (rawIdValue && rawIdValue.trim().length > 0 && !id)
        return null;
    const page = asPositiveInt(url.searchParams.get("page"), 1);
    const pageSize = Math.min(asPositiveInt(url.searchParams.get("pageSize"), 24), 100);
    const qRaw = (url.searchParams.get("q") ?? "").trim();
    return {
        collection: rawCollection,
        id: id ?? undefined,
        page,
        pageSize,
        q: qRaw.length > 0 ? qRaw.toLowerCase() : undefined,
    };
}
export async function GET(context) {
    if (!isEditorAuthenticated(context)) {
        return json({ error: "Unauthorized" }, 401);
    }
    const query = await parseQuery(context);
    if (!query) {
        return json({
            error: "Invalid query. Provide a valid collection name matching a known collection.",
        }, 400);
    }
    try {
        const adapter = await resolveReadAdapter();
        const { collection, id: singleId, page, pageSize, q } = query;
        const collectionConfig = await resolveCollectionStudioConfig(adapter, collection);
        const titled = (entry) => ({ ...entry, title: entryDisplayTitle(collection, entry.id, entry.readError ? null : entry.data, collectionConfig) });
        if (singleId) {
            const { entry, revision, baseRevision } = await readEntrySnapshot(adapter, collection, singleId);
            const entries = entry
                ? [titled(withValidation(collection, entry, revision, baseRevision))]
                : [];
            // With a private draft overlay, also return what visitors see, so the
            // Studio can say whether this entry has unpublished changes and what
            // publishing would change.
            // Seeded the same way, so an entry nobody has edited matches the page.
            const base = getRequestContext()?.publishedAdapter;
            const published = base ? await readEntrySnapshot(withPageContent(base, await loadPageContent()), collection, singleId) : null;
            // With an authorization policy, say when this editor may not edit the
            // entry, so the page can show it read-only instead of failing on save.
            const denied = !(await canPerform("edit", collection, singleId));
            return json({
                entries,
                revision,
                ...(denied ? { editable: false } : {}),
                ...(baseRevision !== undefined ? { baseRevision } : {}),
                ...(published ? { live: { data: published.entry ? stripBodyOverlay(published.entry.data) : null } } : {}),
                pagination: {
                    page: 1,
                    pageSize: 1,
                    total: entries.length,
                    totalPages: entries.length > 0 ? 1 : 0,
                    hasPrev: false,
                    hasNext: false,
                },
            });
        }
        const allIds = await adapter.listEntryIds(collection);
        const cache = new Map();
        async function readEntry(id) {
            if (cache.has(id))
                return cache.get(id);
            let result;
            try {
                const { entry, revision, baseRevision } = await readEntrySnapshot(adapter, collection, id);
                result = entry ? withValidation(collection, entry, revision, baseRevision) : null;
            }
            catch (error) {
                result = { id, data: {}, revision: 0, readError: contentReadFailure(error) };
            }
            cache.set(id, result);
            return result;
        }
        async function readBatch(ids) {
            if (adapter.getEntrySnapshots && ids.some(id => !cache.has(id))) {
                const missing = ids.filter(id => !cache.has(id));
                try {
                    const snapshots = await readEntrySnapshots(adapter, collection, missing);
                    snapshots.forEach(({ entry, revision, baseRevision }, index) => {
                        cache.set(missing[index], entry ? withValidation(collection, entry, revision, baseRevision) : null);
                    });
                }
                catch {
                    // Isolate a corrupt entry or unsupported batch implementation using
                    // existing per-entry errors instead of failing the whole collection.
                    return Promise.all(ids.map(readEntry));
                }
            }
            return Promise.all(ids.map(readEntry));
        }
        const filteredIds = [];
        const fieldMatches = new Map();
        // Bounded batches avoid unbounded simultaneous reads on remote adapters.
        if (q) {
            const titleHits = [];
            const fieldHits = [];
            for (let offset = 0; offset < allIds.length; offset += 20) {
                const batch = await readBatch(allIds.slice(offset, offset + 20));
                for (const entry of batch) {
                    if (!entry)
                        continue;
                    const match = matchEntry(entry.id, entry.data, q);
                    if (match?.kind === "title")
                        titleHits.push(entry.id);
                    else if (match) {
                        fieldHits.push(entry.id);
                        fieldMatches.set(entry.id, { field: match.field, snippet: match.snippet });
                    }
                }
            }
            // Entries named by the query come before ones that only mention it.
            filteredIds.push(...titleHits, ...fieldHits);
        }
        else if (collectionConfig.orderable !== false) {
            // An arrangeable collection lists in its arranged order on every page.
            const listed = [];
            for (let offset = 0; offset < allIds.length; offset += 20) {
                for (const entry of await readBatch(allIds.slice(offset, offset + 20)))
                    if (entry)
                        listed.push(entry);
            }
            filteredIds.push(...listed.sort(compareArrangedOrder).map((entry) => entry.id));
        }
        else
            filteredIds.push(...allIds);
        const total = filteredIds.length;
        const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
        const effectivePage = totalPages === 0 ? 1 : Math.min(page, totalPages);
        const start = (effectivePage - 1) * pageSize;
        const pageIds = filteredIds.slice(start, start + pageSize);
        const unpublished = new Set((await unpublishedEntries(collection)).map((entry) => entry.id));
        const entries = (await readBatch(pageIds))
            .filter((entry) => entry !== null)
            .map((entry) => {
            const match = fieldMatches.get(entry.id);
            return {
                ...titled(entry),
                ...(match ? { match } : {}),
                ...(unpublished.has(entry.id) ? { draft: true } : {}),
            };
        });
        return json({
            entries,
            pagination: {
                page: effectivePage,
                pageSize,
                total,
                totalPages,
                hasPrev: effectivePage > 1,
                hasNext: effectivePage < totalPages,
                q,
            },
            collection,
            source: "adapter",
        });
    }
    catch (error) {
        const failure = contentReadFailure(error);
        return json(failure, failure.code === "storage_error" ? 503 : 422);
    }
}
//# sourceMappingURL=entries.js.map