/**
 * Sätteri mdast plugin that stamps `data-caret-md` bindings (Astro 7).
 *
 * Registered on `markdown.processor.options.mdastPlugins` by the integration
 * when markdown storage is active. Position tracking is opt-in, so the plugin
 * declares `options: { position: true }`. Attributes are written through the
 * per-node `data.hProperties` bag, which Sätteri carries into the rendered
 * HTML like remark-rehype.
 *
 * Type-only imports keep core free of a `satteri` runtime dependency — the
 * package is present in the user's Astro build, never shipped by us.
 */
import { computeStamp, planParagraph } from "./stamp.js";
// Older Sätteri releases reported UTF-8 BYTE offsets while newer releases use
// JS string offsets. Both expose one-based line/column positions in JS string
// space, so prefer those and retain byte conversion as a compatibility fallback
// for processors that omit line/column. Memoized because a document's blocks
// are visited consecutively against the same `ctx.source`.
let byteMapCache = null;
let lineMapCache = null;
function byteToStringIndex(source, byteOffset) {
    if (!byteMapCache || byteMapCache.source !== source) {
        const prefix = new Uint32Array(source.length + 1);
        let bytes = 0;
        for (let i = 0; i < source.length;) {
            const cp = source.codePointAt(i);
            const units = cp > 0xffff ? 2 : 1;
            prefix[i] = bytes;
            if (units === 2)
                prefix[i + 1] = bytes; // low surrogate: mid-char
            bytes += cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
            i += units;
        }
        prefix[source.length] = bytes;
        byteMapCache = { source, prefix };
    }
    const { prefix } = byteMapCache;
    // Smallest string index whose byte-prefix reaches byteOffset.
    let lo = 0;
    let hi = source.length;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (prefix[mid] < byteOffset)
            lo = mid + 1;
        else
            hi = mid;
    }
    return lo;
}
function positionToStringIndex(source, position) {
    if (!position)
        return undefined;
    if (Number.isInteger(position.line)
        && Number.isInteger(position.column)
        && position.line >= 1
        && position.column >= 1) {
        if (!lineMapCache || lineMapCache.source !== source) {
            const starts = [0];
            for (let i = 0; i < source.length; i += 1) {
                if (source.charCodeAt(i) === 10)
                    starts.push(i + 1);
            }
            lineMapCache = { source, starts };
        }
        const lineStart = lineMapCache.starts[position.line - 1];
        if (lineStart !== undefined) {
            const index = lineStart + position.column - 1;
            if (index >= lineStart && index <= source.length)
                return index;
        }
    }
    return position.offset == null ? undefined : byteToStringIndex(source, position.offset);
}
/** Root-to-node child indexes (`indexOf` returns `undefined` at the root). */
function pathOf(node, ctx) {
    const idx = [];
    let cur = node;
    while (cur) {
        const i = ctx.indexOf(cur);
        if (i === undefined)
            break;
        idx.unshift(i);
        cur = ctx.parent(cur);
    }
    return idx;
}
/** Ancestor node types, nearest-first, excluding the node itself. */
function ancestorTypes(node, ctx) {
    const out = [];
    let cur = ctx.parent(node);
    while (cur) {
        out.push(cur.type);
        cur = ctx.parent(cur);
    }
    return out;
}
function stamp(target, ctx, input) {
    const attrs = computeStamp(input);
    if (!attrs)
        return;
    const data = { ...(target.data ?? {}) };
    data.hProperties = { ...data.hProperties, ...attrs };
    ctx.setProperty(target, "data", data);
}
export function caretSatteriPlugin(options) {
    const { contentRoot } = options;
    const base = (node, ctx) => {
        return {
            source: ctx.source,
            fileURL: ctx.fileURL,
            contentRoot,
            start: positionToStringIndex(ctx.source, node.position?.start),
            end: positionToStringIndex(ctx.source, node.position?.end),
        };
    };
    return {
        // Changes to stamp shape must invalidate Astro's cached rendered content.
        name: "caretcms-stamp-paragraphs-v1",
        options: { position: true },
        heading(node, ctx) {
            const parentType = ctx.parent(node)?.type ?? "root";
            stamp(node, ctx, {
                ...base(node, ctx),
                blockPath: pathOf(node, ctx),
                ancestorTypes: ancestorTypes(node, ctx),
                nested: parentType !== "root",
                blockType: "heading",
            });
        },
        paragraph(node, ctx) {
            const parent = ctx.parent(node);
            const plan = planParagraph(parent?.type ?? "root", ctx.indexOf(node));
            if (plan.action === "skip")
                return;
            const target = plan.action === "parent" ? parent : node;
            stamp(target, ctx, {
                ...base(node, ctx), // the paragraph's (marker-free) offsets
                blockPath: pathOf(target, ctx),
                ancestorTypes: ancestorTypes(target, ctx),
                nested: plan.action === "parent" ? true : plan.nested,
                blockType: "paragraph",
            });
        },
    };
}
//# sourceMappingURL=satteri.js.map