import { RICH_ALLOWED_TAGS, RICH_ALLOWED_ATTRS, SAFE_HREF_RE, SCOPED_STYLE_ATTR_RE, classAllowed, } from "./runtime/rich-allowlist.js";
import { getNestedValue } from "./runtime/utils.js";
function getSessionStorageKey(config) {
    return `caretcms:cloud-session:${config.endpoint}:${config.projectId}`;
}
function readStoredSessionToken(config) {
    if (typeof window === "undefined")
        return undefined;
    try {
        const value = window.localStorage.getItem(getSessionStorageKey(config));
        return value && value.trim().length > 0 ? value.trim() : undefined;
    }
    catch {
        return undefined;
    }
}
function writeStoredSessionToken(config, token) {
    if (typeof window === "undefined")
        return;
    try {
        window.localStorage.setItem(getSessionStorageKey(config), token);
    }
    catch {
        // Ignore localStorage failures.
    }
}
function clearStoredSessionToken(config) {
    if (typeof window === "undefined")
        return;
    try {
        window.localStorage.removeItem(getSessionStorageKey(config));
    }
    catch {
        // Ignore localStorage failures.
    }
}
function normalizeConfig(input) {
    const endpoint = input.endpoint.trim().replace(/\/$/, "");
    const projectId = input.projectId.trim();
    if (!endpoint) {
        throw new Error("[caretcms] Cloud runtime requires an endpoint.");
    }
    if (!projectId) {
        throw new Error("[caretcms] Cloud runtime requires a projectId.");
    }
    return {
        endpoint,
        projectId,
        contentPath: input.contentPath?.trim() || "/content",
        publicToken: input.publicToken?.trim() || undefined,
        sessionToken: input.sessionToken?.trim() ||
            readStoredSessionToken({
                ...input,
                endpoint,
                projectId,
            }),
        environment: input.environment?.trim() || undefined,
    };
}
function readHashSessionToken() {
    if (typeof window === "undefined")
        return undefined;
    const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
    if (!hash)
        return undefined;
    const params = new URLSearchParams(hash);
    const token = params.get("cms-session");
    return token && token.trim().length > 0 ? token.trim() : undefined;
}
function clearHashSessionToken() {
    if (typeof window === "undefined")
        return;
    const url = new URL(window.location.href);
    url.hash = "";
    window.history.replaceState({}, document.title, url.toString());
}
function hydrateSessionFromUrl(config) {
    const token = readHashSessionToken();
    if (!token)
        return config;
    writeStoredSessionToken(config, token);
    clearHashSessionToken();
    return { ...config, sessionToken: token };
}
function parseScopeValue(value) {
    if (!value)
        return null;
    const [collection, id] = value.split("::");
    if (!collection || !id)
        return null;
    return { collection, id };
}
export function getNearestScope(element) {
    // ANCESTORS only — never the element itself. The server's rewrite engine
    // processes scope frames for tags opened BEFORE the bound element, so an
    // element carrying both data-caret-scope and data-caret does not scope its
    // own binding; a bare `closest()` here (which matches self) silently
    // resolved such bindings differently from the published render.
    const scopeElement = element.parentElement?.closest("[data-caret-scope]") ?? null;
    if (!scopeElement)
        return null;
    return parseScopeValue(scopeElement.getAttribute("data-caret-scope"));
}
export function resolveBindingValue(value, scope) {
    const parts = value.split("::");
    if (parts.length === 3) {
        return {
            collection: parts[0],
            id: parts[1],
            field: parts[2],
        };
    }
    if (parts.length === 1 && scope) {
        return {
            collection: scope.collection,
            id: scope.id,
            field: value,
        };
    }
    return null;
}
function hasChildMarkup(element) {
    return Array.from(element.childNodes).some((node) => node.nodeType === Node.ELEMENT_NODE);
}
function collectBindings(root = document) {
    const nodes = Array.from(root.querySelectorAll("[data-caret]"));
    const bindings = [];
    for (const element of nodes) {
        const raw = element.getAttribute("data-caret");
        if (!raw)
            continue;
        const resolved = resolveBindingValue(raw, getNearestScope(element));
        if (!resolved)
            continue;
        const tagName = element.tagName.toLowerCase();
        const isRich = tagName !== "img" && element.hasAttribute("data-caret-rich");
        bindings.push({
            element,
            ...resolved,
            isImage: tagName === "img",
            isRich,
            hasChildMarkup: tagName !== "img" && hasChildMarkup(element),
        });
    }
    return bindings;
}
// --- Browser-side HTML sanitizer for rich text ---
// Allowlist + matcher come from runtime/rich-allowlist.ts (shared with the
// server sanitizer); static/cms/editor/sanitize.js mirrors them by hand.
function sanitizeHtmlBrowser(html) {
    if (!html)
        return "";
    const allowedClasses = (typeof window !== "undefined"
        ? window.__CARET__
            ?.allowedClasses
        : undefined) ?? null;
    const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
    sanitizeNode(doc.body, allowedClasses);
    return doc.body.innerHTML;
}
function sanitizeNode(parent, allowedClasses) {
    const children = Array.from(parent.childNodes);
    for (const node of children) {
        if (node.nodeType === Node.TEXT_NODE)
            continue;
        if (node.nodeType !== Node.ELEMENT_NODE) {
            parent.removeChild(node);
            continue;
        }
        const el = node;
        const tag = el.tagName.toLowerCase();
        if (!RICH_ALLOWED_TAGS.has(tag)) {
            const frag = document.createDocumentFragment();
            while (el.firstChild)
                frag.appendChild(el.firstChild);
            parent.replaceChild(frag, el);
            sanitizeNode(parent, allowedClasses);
            return;
        }
        const allowed = RICH_ALLOWED_ATTRS[tag];
        const classPatterns = allowedClasses ? allowedClasses[tag] : undefined;
        const attrs = Array.from(el.attributes);
        for (const attr of attrs) {
            // Astro's scoped-style marker, kept without its value.
            if (SCOPED_STYLE_ATTR_RE.test(attr.name)) {
                el.setAttribute(attr.name, "");
                continue;
            }
            // class is gated by the per-tag allowlist, not RICH_ALLOWED_ATTRS
            if (attr.name === "class") {
                if (!classPatterns) {
                    el.removeAttribute("class");
                    continue;
                }
                const kept = attr.value
                    .split(/\s+/)
                    .filter((c) => c !== "" && classAllowed(c, classPatterns))
                    .join(" ");
                if (kept)
                    el.setAttribute("class", kept);
                else
                    el.removeAttribute("class");
                continue;
            }
            if (!allowed || !allowed.has(attr.name)) {
                el.removeAttribute(attr.name);
            }
        }
        if (tag === "a") {
            const href = el.getAttribute("href") || "";
            if (!SAFE_HREF_RE.test(href)) {
                el.removeAttribute("href");
            }
            if (href && /^https?:/i.test(href)) {
                el.setAttribute("target", "_blank");
                el.setAttribute("rel", "noopener noreferrer");
            }
        }
        sanitizeNode(el, allowedClasses);
    }
}
function getNestedString(data, path) {
    // Shared dot-path semantics: arrays traverse by numeric index. The previous
    // local copy bailed on arrays, so `items.0.title` resolved server-side (the
    // rewrite engine) but silently failed here in the cloud live-sync path.
    const value = getNestedValue(data, path);
    return typeof value === "string" ? value : undefined;
}
function applyBindingValue(binding, value) {
    if (binding.isImage) {
        binding.element.setAttribute("src", value);
        return;
    }
    if (binding.isRich) {
        binding.element.innerHTML = sanitizeHtmlBrowser(value);
        return;
    }
    if (binding.hasChildMarkup)
        return;
    binding.element.textContent = value;
}
function buildContentUrl(config, path = "") {
    const contentPath = config.contentPath ?? "/content";
    const normalizedPath = contentPath.endsWith("/") ? contentPath.slice(0, -1) : contentPath;
    return new URL(`${normalizedPath}${path}`, `${config.endpoint}/`);
}
function buildAuthHeaders(config, includePublicToken = false) {
    const headers = {};
    if (includePublicToken && config.publicToken) {
        headers["x-caret-token"] = config.publicToken;
    }
    if (config.sessionToken) {
        headers.Authorization = `Bearer ${config.sessionToken}`;
    }
    return headers;
}
async function fetchEntries(config, keys) {
    if (keys.length === 0)
        return {};
    const url = new URL(config.contentPath ?? "/content", `${config.endpoint}/`);
    url.searchParams.set("projectId", config.projectId);
    url.searchParams.set("keys", keys.join(","));
    if (config.environment) {
        url.searchParams.set("environment", config.environment);
    }
    const headers = buildAuthHeaders(config, true);
    const response = await fetch(url.toString(), { headers });
    if (!response.ok) {
        throw new Error(`[caretcms] Cloud content request failed (${response.status}).`);
    }
    const body = (await response.json());
    if (!body?.entries)
        return {};
    if (Array.isArray(body.entries)) {
        return body.entries.reduce((acc, entry) => {
            if (entry && typeof entry.key === "string" && entry.data && typeof entry.data === "object") {
                acc[entry.key] = entry.data;
            }
            return acc;
        }, {});
    }
    return body.entries;
}
async function runCloudOverlay(config, root = document) {
    const bindings = collectBindings(root);
    if (bindings.length === 0)
        return;
    const entryKeys = [...new Set(bindings.map((binding) => `${binding.collection}::${binding.id}`))];
    const entries = await fetchEntries(config, entryKeys);
    for (const binding of bindings) {
        const entry = entries[`${binding.collection}::${binding.id}`];
        if (!entry)
            continue;
        const value = getNestedString(entry, binding.field);
        if (value === undefined)
            continue;
        applyBindingValue(binding, value);
    }
}
export async function bootstrapCloudCms(config, root = document) {
    const normalized = hydrateSessionFromUrl(normalizeConfig(config));
    if (document.readyState === "loading") {
        await new Promise((resolve) => {
            document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
        });
    }
    await runCloudOverlay(normalized, root);
}
export function hasCloudCmsSession(config) {
    const normalized = normalizeConfig(config);
    return typeof normalized.sessionToken === "string" && normalized.sessionToken.length > 0;
}
export function redirectToCloudCmsLogin(config, redirectTo) {
    const normalized = normalizeConfig(config);
    const url = buildContentUrl(normalized, "/admin");
    url.searchParams.set("projectId", normalized.projectId);
    url.searchParams.set("redirect", redirectTo ?? window.location.href);
    window.location.href = url.toString();
}
//# sourceMappingURL=browser-runtime.js.map