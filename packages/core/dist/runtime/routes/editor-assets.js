export const prerender = false;
import { getRuntimeConfig } from "../config.js";
import { EN_STUDIO_MESSAGES, editorMessages } from "../i18n.js";
// The editor's messages in the site's locale, with `dictionary` overrides:
// a module built from the resolved Studio dictionary (see editor/i18n.js).
const EDITOR_MESSAGES_PATH = "editor/messages.js";
let _editorMessages = null;
function editorMessagesModule() {
    if (_editorMessages)
        return _editorMessages;
    // English underneath, so a key missing from the configured dictionary still reads.
    const messages = { ...editorMessages(EN_STUDIO_MESSAGES), ...editorMessages(getRuntimeConfig().messages) };
    _editorMessages = `export default ${JSON.stringify(messages).replace(/</g, "\\u003c")};\n`;
    return _editorMessages;
}
let _assetModules = null;
function getAssetModules() {
    if (_assetModules)
        return _assetModules;
    try {
        // @ts-expect-error Vite injects `glob` on import.meta at build time.
        _assetModules = import.meta.glob("../../../static/cms/**/*.{js,css,json,svg}", { eager: true, query: "?raw", import: "default" });
    }
    catch {
        _assetModules = {};
    }
    return _assetModules;
}
const ASSET_KEY_PREFIX = "../../../static/cms/";
let _assets = null;
function getAssets() {
    if (_assets)
        return _assets;
    const built = {};
    for (const [path, body] of Object.entries(getAssetModules())) {
        if (typeof body !== "string")
            continue;
        const key = path.startsWith(ASSET_KEY_PREFIX)
            ? path.slice(ASSET_KEY_PREFIX.length)
            : path;
        built[key] = body;
    }
    _assets = built;
    return _assets;
}
const MIME_TYPES = {
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
};
function getMimeType(path) {
    const ext = path.slice(path.lastIndexOf("."));
    return MIME_TYPES[ext] ?? "application/octet-stream";
}
// Content hashes for ETags. The assets @import one another by unversioned URLs,
// so a long max-age would let an upgraded page pair new markup with stale CSS.
export function contentEtag(body) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < body.length; i++) {
        hash ^= body.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return `"${(hash >>> 0).toString(36)}-${body.length.toString(36)}"`;
}
const etags = new Map();
function etagFor(path, body) {
    let tag = etags.get(path);
    if (!tag) {
        tag = contentEtag(body);
        etags.set(path, tag);
    }
    return tag;
}
function sanitizePath(raw) {
    const normalized = raw.replace(/\\/g, "/");
    if (normalized.includes("..") || normalized.includes("\0"))
        return null;
    if (/[^a-zA-Z0-9_./-]/.test(normalized))
        return null;
    return normalized;
}
export async function GET(context) {
    const rawPath = (context.params.path ?? "").toString();
    const safePath = sanitizePath(rawPath);
    if (!safePath) {
        return new Response("Not found", { status: 404 });
    }
    const body = safePath === EDITOR_MESSAGES_PATH ? editorMessagesModule() : getAssets()[safePath];
    if (body === undefined) {
        return new Response("Not found", { status: 404 });
    }
    // In dev, never cache — editor source files change frequently and a cached
    // copy hides edits. In prod, revalidate every use: an unchanged file costs a
    // 304, and a package upgrade is picked up immediately.
    const development = process.env.NODE_ENV === "development";
    const cacheControl = development ? "no-cache, no-store, must-revalidate" : "public, no-cache";
    const etag = etagFor(safePath, body);
    if (!development && context.request.headers.get("if-none-match") === etag) {
        return new Response(null, { status: 304, headers: { ETag: etag, "Cache-Control": cacheControl } });
    }
    return new Response(body, {
        status: 200,
        headers: {
            "Content-Type": getMimeType(safePath),
            "Cache-Control": cacheControl,
            ETag: etag,
        },
    });
}
//# sourceMappingURL=editor-assets.js.map