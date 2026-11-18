import { resolveStudioDictionary } from "./i18n.js";
export function normalizePath(input, fallback) {
    if (!input)
        return fallback;
    const trimmed = input.trim();
    if (!trimmed)
        return fallback;
    const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    if (withLeadingSlash.length > 1 && withLeadingSlash.endsWith("/")) {
        return withLeadingSlash.slice(0, -1);
    }
    return withLeadingSlash;
}
function safeParse(raw, fallback) {
    if (!raw)
        return fallback;
    try {
        return JSON.parse(raw);
    }
    catch {
        return fallback;
    }
}
const DEFAULT_BRAND = {
    name: "Content Studio",
    logo: null,
    faviconUrl: null,
};
const DEFAULT_THEME = {
    presetId: null,
    tokenOverrides: {},
};
export function getRuntimeConfig() {
    const mountPath = normalizePath(__ASTRO_CARET_MOUNT_PATH__, "/admin");
    const apiBasePath = normalizePath(__ASTRO_CARET_API_BASE_PATH__, "/api/cms");
    const editorHome = normalizePath(__ASTRO_CARET_EDITOR_HOME__, "/");
    const mode = (__ASTRO_CARET_MODE__ ?? "embedded");
    const theme = safeParse(__ASTRO_CARET_THEME_CONFIG__, DEFAULT_THEME);
    const brand = safeParse(__ASTRO_CARET_BRAND_CONFIG__, DEFAULT_BRAND);
    const locale = (__ASTRO_CARET_LOCALE__ === "es" ? "es" : "en");
    const messages = safeParse(__ASTRO_CARET_DICTIONARY__, resolveStudioDictionary(locale));
    // Cloud sign-in and editing happen on the cloud host, not over this site.
    const inlineEditor = mode !== "cloud" && (typeof __ASTRO_CARET_INLINE_EDITOR__ === "undefined" || __ASTRO_CARET_INLINE_EDITOR__ !== false);
    return { mountPath, apiBasePath, editorHome, mode, theme, brand, locale, messages, inlineEditor };
}
//# sourceMappingURL=config.js.map