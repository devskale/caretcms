import { decodeHtmlEntities } from "./decode-entities.js";
/** Fields that name an entry, in the order the Studio shows them as its title. */
/** Fields that usually name an entry, best first. A page's `name` is often a
 *  quoted person's, so title-like fields come before it. */
export const ENTRY_TITLE_KEYS = ["title", "headline", "heading", "name", "label", "question", "company_name"];
const SNIPPET_RADIUS = 40;
/** Readable text of a stored value: tags dropped, entities decoded, whitespace collapsed. */
export function plainText(value) {
    return decodeHtmlEntities(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}
/** Every string in the entry with its dotted path, in field order. */
function* stringFields(value, path) {
    if (typeof value === "string") {
        yield [path, value];
    }
    else if (Array.isArray(value)) {
        for (let index = 0; index < value.length; index++)
            yield* stringFields(value[index], path ? `${path}.${index}` : String(index));
    }
    else if (value && typeof value === "object") {
        for (const [key, child] of Object.entries(value)) {
            if (key.startsWith("__"))
                continue;
            yield* stringFields(child, path ? `${path}.${key}` : key);
        }
    }
}
/** The words around the first match, with ellipses where text was cut. */
function snippetAround(text, at, length) {
    let start = Math.max(0, at - SNIPPET_RADIUS);
    let end = Math.min(text.length, at + length + SNIPPET_RADIUS);
    // Cut at word boundaries, never inside the match.
    if (start > 0) {
        const space = text.indexOf(" ", start);
        if (space >= 0 && space < at)
            start = space + 1;
    }
    if (end < text.length) {
        const space = text.lastIndexOf(" ", end);
        if (space > at + length)
            end = space;
    }
    return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}
/**
 * Match a lowercase query against an entry: its id or title first, then the
 * readable text of every other field.
 */
export function matchEntry(id, data, query) {
    const title = ENTRY_TITLE_KEYS.map((key) => data[key]).find((value) => typeof value === "string" && value.length > 0);
    if (id.toLowerCase().includes(query) || (title !== undefined && title.toLowerCase().includes(query)))
        return { kind: "title" };
    for (const [field, raw] of stringFields(data, "")) {
        const text = plainText(raw);
        const at = text.toLowerCase().indexOf(query);
        if (at >= 0)
            return { kind: "field", field, snippet: snippetAround(text, at, query.length) };
    }
    return null;
}
//# sourceMappingURL=entry-search.js.map