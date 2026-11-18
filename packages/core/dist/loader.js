/**
 * Astro LiveLoader backed by the configured StorageAdapter.
 *
 * Compatible with Astro 6 and 7 (stable live content collections). On Astro 7
 * the loader also attaches `cacheHint` tags for publish-time purging.
 *
 * Usage in src/caret.config.ts:
 *
 *   import { defineLiveCollection } from 'astro:content';
 *   import { caretLoader } from '@caretcms/core';
 *
 *   const pages = defineLiveCollection({
 *     loader: caretLoader('pages'),
 *   });
 *   export const collections = { pages };
 */
import { getRequestContext, requireRequestContext, } from "./runtime/request-context.js";
import { stegaCombine } from "./runtime/stega.js";
import { stripBodyOverlay } from "./runtime/utils.js";
import { getRegisteredSchema } from "./runtime/schema-registry.js";
import { resolveCollectionStudioConfig } from "./runtime/schema-registry.js";
import { isPublicEntry } from "./runtime/collection-policy.js";
import { validateJsonSchema } from "./schema-utils.js";
export class CaretLoaderError extends Error {
    constructor(message, cause) {
        super(message);
        this.name = "CaretLoaderError";
        if (cause !== undefined) {
            this.cause = cause;
        }
    }
}
/**
 * Draft-mode only: hide each string field's binding key (`collection::id::field`)
 * inside the value itself via stega. The key then rides through component props,
 * slots, and `.map()` loops, so the editor overlay can offer click-to-edit on
 * any rendered string with no `data-caret` attribute. Visitors are never editors,
 * so this is a no-op for them; the rewrite middleware also strips stega from
 * published HTML as a backstop. Nested fields use a dot-path (matching the
 * rewrite engine's `field.path` resolution).
 */
function encodeEntryData(collection, id, data) {
    const walk = (value, path) => {
        if (typeof value === "string") {
            return stegaCombine(value, `${collection}::${id}::${path}`);
        }
        if (Array.isArray(value)) {
            return value.map((item, i) => walk(item, `${path}.${i}`));
        }
        if (value && typeof value === "object") {
            const out = {};
            for (const [k, v] of Object.entries(value)) {
                out[k] = walk(v, `${path}.${k}`);
            }
            return out;
        }
        return value;
    };
    const out = {};
    for (const [k, v] of Object.entries(data))
        out[k] = walk(v, k);
    return out;
}
/** Whether the current request should receive stega-encoded draft content. */
function isEditorRequest() {
    return getRequestContext()?.editor === true;
}
function requireAdapter() {
    try {
        return requireRequestContext().adapter;
    }
    catch (cause) {
        throw new CaretLoaderError("StorageAdapter not initialized. " +
            "Ensure @caretcms/core middleware runs before page rendering " +
            "(the integration registers it with order: 'pre').", cause);
    }
}
function validationError(collection, id, data) {
    const registered = getRegisteredSchema(collection);
    if (!registered)
        return null;
    const issues = validateJsonSchema(data, registered.schema);
    if (issues.length === 0)
        return null;
    const detail = issues
        .slice(0, 5)
        .map((issue) => `${issue.path || "entry"}: ${issue.message}`)
        .join("; ");
    return new CaretLoaderError(`Stored entry ${collection}::${id} does not match its registered schema (${detail})`);
}
/** Cache tags for a collection / entry: publishing can purge by these (Astro 7). */
const collectionTag = (collection) => `caret:${collection}`;
const entryTags = (collection, id) => [
    `caret:${collection}`,
    `caret:${collection}::${id}`,
];
/**
 * Create an Astro LiveLoader that reads from the configured StorageAdapter.
 * Works on Astro 6 and 7.
 *
 * @param collection - The collection name (must be known to the adapter).
 */
export function caretLoader(collection) {
    return {
        name: `caret:${collection}`,
        async loadEntry({ filter }) {
            try {
                const adapter = requireAdapter();
                const id = filter.id;
                const entry = await adapter.getEntry(collection, id);
                if (!entry)
                    return undefined;
                const editor = isEditorRequest();
                const clean = stripBodyOverlay(entry.data);
                const collectionConfig = await resolveCollectionStudioConfig(adapter, collection);
                if (!editor && !isPublicEntry(clean, collectionConfig))
                    return undefined;
                const invalid = validationError(collection, entry.id, clean);
                if (invalid)
                    return { error: invalid };
                const data = editor ? encodeEntryData(collection, entry.id, clean) : clean;
                const result = { id: entry.id, data };
                // Published content is cache-taggable so a publish can purge it by tag.
                // Editor/draft requests get NO hint — edits must show immediately.
                if (!editor)
                    result.cacheHint = { tags: entryTags(collection, entry.id) };
                return result;
            }
            catch (error) {
                return {
                    error: new CaretLoaderError(`Failed to load entry ${collection}::${filter.id}`, error),
                };
            }
        },
        async loadCollection() {
            try {
                const adapter = requireAdapter();
                const allEntries = await adapter.listEntries(collection);
                const editor = isEditorRequest();
                const collectionConfig = await resolveCollectionStudioConfig(adapter, collection);
                const entries = [];
                for (const entry of allEntries) {
                    const clean = stripBodyOverlay(entry.data);
                    if (!editor && !isPublicEntry(clean, collectionConfig))
                        continue;
                    const invalid = validationError(collection, entry.id, clean);
                    if (invalid) {
                        console.error(`[caretcms] ${invalid.message}. Skipping this entry; other valid entries remain available.`);
                        continue;
                    }
                    const mapped = {
                        id: entry.id,
                        data: editor ? encodeEntryData(collection, entry.id, clean) : clean,
                    };
                    if (!editor)
                        mapped.cacheHint = { tags: entryTags(collection, entry.id) };
                    entries.push(mapped);
                }
                const result = { entries };
                // Collection-level tag (merged with per-entry tags by Astro); drafts unhinted.
                if (!editor)
                    result.cacheHint = { tags: [collectionTag(collection)] };
                return result;
            }
            catch (error) {
                return {
                    error: new CaretLoaderError(`Failed to load collection ${collection}`, error),
                };
            }
        },
    };
}
//# sourceMappingURL=loader.js.map