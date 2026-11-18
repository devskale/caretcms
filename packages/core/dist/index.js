import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { fileURLToPath } from "node:url";
import { basename, dirname, join, resolve } from "node:path";
import { COLLECTION_NAME_RE } from "./runtime/storage/id-contracts.js";
import { contentConfigDataFiles, uneditableCollections } from "./runtime/storage/content-config.js";
import { bakeStaticHtmlFiles } from "./runtime/static-bake.js";
import { caretSatteriPlugin } from "./markdown/satteri.js";
import { resolveStudioDictionary, } from "./runtime/i18n.js";
import { caretRemarkPlugin } from "./markdown/remark.js";
import { publicationField, resolvePreviewPath } from "./runtime/collection-policy.js";
import { withDevRequest } from "./runtime/dev-request-context.js";
import { createSelfWriteReloadPlugin } from "./runtime/self-write-reload-plugin.js";
import { createPageContentPlugin } from "./page-content-plugin.js";
export { FilesystemAdapter } from "./runtime/storage/filesystem-adapter.js";
export { MarkdownAdapter } from "./runtime/storage/markdown-adapter.js";
export { InMemoryAdapter } from "./runtime/storage/in-memory-adapter.js";
export { FilesystemUploadHandler } from "./runtime/storage/filesystem-upload-handler.js";
export { bindEntry } from "./runtime/bind.js";
export { caretLoader, CaretLoaderError } from "./loader.js";
export { editable } from "./editable.js";
// Strip stega edit-metadata from a live field value before it flows into a
// URL, attribute, or anything parsed (dates, JSON): the invisible characters
// are safe in visible text but corrupt non-text contexts. Same intent as
// Vercel's `vercelStegaClean`.
export { stegaClean } from "./runtime/stega.js";
const VIRTUAL_PROVIDER_MODULE_ID = "virtual:caretcms/providers";
const RESOLVED_VIRTUAL_PROVIDER_MODULE_ID = `\0${VIRTUAL_PROVIDER_MODULE_ID}`;
const VIRTUAL_SCHEMAS_MODULE_ID = "virtual:caretcms/schemas";
const RESOLVED_VIRTUAL_SCHEMAS_MODULE_ID = `\0${VIRTUAL_SCHEMAS_MODULE_ID}`;
const FILESYSTEM_STORAGE_ENTRYPOINT = "@caretcms/core/providers/storage/filesystem";
const MARKDOWN_STORAGE_ENTRYPOINT = "@caretcms/core/providers/storage/markdown";
const LOCAL_UPLOADS_ENTRYPOINT = "@caretcms/core/providers/uploads/local";
const SIMULATED_DEPLOYMENT_ENTRYPOINT = "@caretcms/core/providers/deployment/simulated";
const GITHUB_DEPLOYMENT_ENTRYPOINT = "@caretcms/core/providers/deployment/github";
export function defineStorageProvider(options) {
    return {
        kind: "storage",
        entrypoint: options.entrypoint,
        exportName: options.exportName ?? "default",
        options: options.options ?? null,
    };
}
export function defineUploadProvider(options) {
    return {
        kind: "uploads",
        entrypoint: options.entrypoint,
        exportName: options.exportName ?? "default",
        options: options.options ?? null,
    };
}
export function defineIdentityProvider(options) {
    return {
        kind: "identity",
        entrypoint: options.entrypoint,
        exportName: options.exportName ?? "default",
        options: options.options ?? null,
    };
}
export function defineDeploymentProvider(options) {
    return {
        kind: "deployment",
        entrypoint: options.entrypoint,
        exportName: options.exportName ?? "default",
        options: options.options ?? null,
    };
}
/** Deterministic local deployment status provider for development and tests. */
export function simulatedDeployment(options) {
    return defineDeploymentProvider({
        entrypoint: SIMULATED_DEPLOYMENT_ENTRYPOINT,
        exportName: "simulatedDeploymentProvider",
        options,
    });
}
/** GitHub Deployments status provider for deployment pipelines that preserve Caret metadata. */
export function githubDeployment(options) {
    return defineDeploymentProvider({
        entrypoint: GITHUB_DEPLOYMENT_ENTRYPOINT,
        exportName: "githubDeploymentProvider",
        options,
    });
}
export function filesystemStorage(options) {
    return defineStorageProvider({
        entrypoint: FILESYSTEM_STORAGE_ENTRYPOINT,
        exportName: "filesystemStorageProvider",
        options,
    });
}
export function markdownStorage(options) {
    return defineStorageProvider({
        entrypoint: MARKDOWN_STORAGE_ENTRYPOINT,
        exportName: "markdownStorageProvider",
        options,
    });
}
export function localUploads(options) {
    return defineUploadProvider({
        entrypoint: LOCAL_UPLOADS_ENTRYPOINT,
        exportName: "localUploadsProvider",
        options,
    });
}
import { normalizePath as normalizeMountPath } from "./runtime/config.js";
/**
 * `astro dev` and `astro preview` expose `.env` values to `import.meta.env`
 * only, but CaretCMS reads its server settings (session secret, edit password)
 * from `process.env`. Load `CARET_*` keys from the project's env files, in
 * Vite's order (`.env`, `.env.local`, `.env.<mode>`, `.env.<mode>.local`, later
 * wins), without overriding anything already set in the real environment.
 */
export function loadCaretEnvFiles(root, mode, env = process.env) {
    const values = {};
    for (const name of [".env", ".env.local", `.env.${mode}`, `.env.${mode}.local`]) {
        let source;
        try {
            source = readFileSync(join(root, name), "utf8");
        }
        catch {
            continue;
        }
        for (const [key, value] of Object.entries(parseEnv(source))) {
            if (key.startsWith("CARET_") && typeof value === "string")
                values[key] = value;
        }
    }
    const loaded = [];
    for (const [key, value] of Object.entries(values)) {
        if (env[key] !== undefined && env[key] !== "")
            continue;
        env[key] = value;
        loaded.push(key);
    }
    return loaded;
}
function normalizeMode(input) {
    return input ?? "embedded";
}
function validateCollectionOptions(collections, schemas) {
    for (const [collection, config] of Object.entries(collections)) {
        if (config.publication) {
            const field = publicationField(config);
            if (!field) {
                throw new Error(`[caretcms] Collection "${collection}" has an invalid publication field.`);
            }
            const schema = schemas[collection];
            const properties = schema?.properties;
            const fieldSchema = properties && typeof properties === "object" && !Array.isArray(properties)
                ? properties[field]
                : null;
            if (!fieldSchema || typeof fieldSchema !== "object" || Array.isArray(fieldSchema)
                || fieldSchema.type !== "boolean") {
                throw new Error(`[caretcms] Collection "${collection}" manages publication through "${field}", `
                    + `so schemas.${collection}.properties.${field} must be a boolean field.`);
            }
        }
        if (typeof config.previewPath === "string") {
            if (!resolvePreviewPath(config, "preview")) {
                throw new Error(`[caretcms] Collection "${collection}" has an invalid previewPath.`);
            }
            continue;
        }
        if (config.previewPath) {
            for (const id of Object.keys(config.previewPath)) {
                if (!resolvePreviewPath(config, id)) {
                    throw new Error(`[caretcms] Collection "${collection}" has an invalid previewPath for "${id}".`);
                }
            }
        }
    }
}
function normalizeCloudOptions(input) {
    const endpoint = input.endpoint.trim().replace(/\/$/, "");
    const projectId = input.projectId.trim();
    if (!endpoint) {
        throw new Error("[caretcms] Cloud mode requires cloud.endpoint.");
    }
    if (!projectId) {
        throw new Error("[caretcms] Cloud mode requires cloud.projectId.");
    }
    return {
        endpoint,
        projectId,
        contentPath: input.contentPath?.trim() || "/content",
        publicToken: input.publicToken?.trim() || undefined,
        environment: input.environment?.trim() || undefined,
    };
}
function isProviderReference(value, kind) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }
    const candidate = value;
    return (candidate.kind === kind &&
        typeof candidate.entrypoint === "string" &&
        candidate.entrypoint.trim().length > 0);
}
function defaultProviders(mode) {
    if (mode === "cloud") {
        return {
            storage: null,
            uploads: null,
        };
    }
    return {
        storage: filesystemStorage(),
        uploads: localUploads(),
    };
}
function resolveTheme(input) {
    if (!input)
        return { presetId: null, tokenOverrides: {} };
    if (typeof input === "string") {
        return { presetId: input, tokenOverrides: {} };
    }
    return {
        presetId: input.preset ?? null,
        tokenOverrides: input.tokens ?? {},
    };
}
function resolveBrand(input) {
    return {
        name: input?.name?.trim() || "Content Studio",
        logo: input?.logo?.trim() || null,
        faviconUrl: input?.faviconUrl?.trim() || null,
    };
}
function resolveDelivery(input) {
    if (!input || input === "auto") {
        return {
            mode: "auto",
            bake: true,
            publish: { webhookUrl: null, method: "POST", headers: {} },
        };
    }
    if (input === "server") {
        return {
            mode: "server",
            bake: false,
            publish: { webhookUrl: null, method: "POST", headers: {} },
        };
    }
    if (input === "static") {
        return {
            mode: "static",
            bake: true,
            publish: { webhookUrl: null, method: "POST", headers: {} },
        };
    }
    const mode = input.mode ?? "auto";
    const staticDelivery = mode === "static";
    return {
        mode,
        bake: input.bake ?? (mode === "auto" ? true : staticDelivery),
        publish: {
            webhookUrl: input.publish?.webhookUrl?.trim() || null,
            timeoutMs: input.publish?.timeoutMs,
            method: input.publish?.method ?? "POST",
            headers: input.publish?.headers ?? {},
        },
    };
}
function resolveEffectiveDelivery(delivery, astroOutput) {
    const mode = delivery.mode === "auto"
        ? astroOutput === "static"
            ? "static"
            : "server"
        : delivery.mode;
    return {
        mode,
        bake: mode === "static" ? delivery.bake : false,
        publish: delivery.publish,
    };
}
function assertDeliveryMatchesAstroOutput(delivery, astroOutput) {
    if (delivery.mode === "static" && astroOutput !== "static") {
        throw new Error(`[caretcms] delivery: "static" requires Astro output: "static"; this project has output: ${JSON.stringify(astroOutput)}. Remove output: "server" (Astro defaults to static), or set delivery: "server" for runtime middleware.`);
    }
}
/** Every key resolveCaretOptions reads. Anything else in the options object is
 *  a typo (`mountpath`) silently falling back to a default — name it instead. */
const KNOWN_OPTION_KEYS = new Set([
    "mode", "cloud", "storage", "uploads", "identity", "deployment", "mountPath", "apiBasePath",
    "enableAdmin", "enableInlineEditor", "bindContent", "editorHome", "schemas", "collections", "locale", "dictionary",
    "allowedClasses", "bodyEditing", "delivery", "theme", "brand",
]);
/** Unknown option keys, each with its closest known key when one is plausible. */
function unknownOptionWarnings(options) {
    return Object.keys(options)
        .filter((key) => !KNOWN_OPTION_KEYS.has(key))
        .map((key) => {
        const lower = key.toLowerCase();
        const near = [...KNOWN_OPTION_KEYS].find((k) => k.toLowerCase() === lower);
        return near ? `"${key}" (did you mean "${near}"?)` : `"${key}"`;
    });
}
function resolveCaretOptions(options) {
    const mode = normalizeMode(options.mode);
    const defaults = defaultProviders(mode);
    const cloud = mode === "cloud"
        ? normalizeCloudOptions(options.cloud)
        : null;
    const editorHome = normalizeMountPath(options.editorHome, "/");
    if (editorHome.startsWith("//")) {
        throw new Error(`[caretcms] editorHome must be a same-origin absolute path (got ${JSON.stringify(options.editorHome)}).`);
    }
    const collections = options.collections ?? {};
    const schemas = options.schemas ?? {};
    validateCollectionOptions(collections, schemas);
    return {
        mountPath: normalizeMountPath(options.mountPath, "/admin"),
        apiBasePath: normalizeMountPath(options.apiBasePath, "/api/cms"),
        mode,
        storage: isProviderReference(options.storage, "storage")
            ? options.storage
            : defaults.storage,
        uploads: isProviderReference(options.uploads, "uploads")
            ? options.uploads
            : defaults.uploads,
        identity: isProviderReference(options.identity, "identity")
            ? options.identity
            : null,
        deployment: isProviderReference(options.deployment, "deployment")
            ? options.deployment
            : null,
        enableAdmin: options.enableAdmin ?? mode !== "cloud",
        enableInlineEditor: options.enableInlineEditor ?? mode !== "cloud",
        bindContent: options.bindContent ?? true,
        editorHome,
        cloud,
        schemas,
        collections,
        locale: options.locale ?? "en",
        dictionary: resolveStudioDictionary(options.locale ?? "en", options.dictionary),
        allowedClasses: options.allowedClasses ?? {},
        bodyEditing: options.bodyEditing ?? true,
        delivery: resolveDelivery(options.delivery),
        theme: resolveTheme(options.theme),
        brand: resolveBrand(options.brand),
    };
}
async function loadProviderReference(reference) {
    if (!reference)
        return null;
    const mod = (await import(/* @vite-ignore */ reference.entrypoint));
    const exportName = reference.exportName ?? "default";
    const resolvedExport = mod[exportName];
    if (resolvedExport == null) {
        throw new Error(`[caretcms] Could not resolve provider export "${reference.exportName ?? "default"}" from ${reference.entrypoint}.`);
    }
    return typeof resolvedExport === "function"
        ? (await resolvedExport(reference.options ?? null))
        : resolvedExport;
}
function buildProviderLoader(functionName, reference) {
    if (!reference) {
        return `export async function ${functionName}(){return null;}`;
    }
    const importName = `__caret_${functionName}`;
    const exportName = reference.exportName ?? "default";
    const exportLookup = exportName === "default"
        ? `${importName}.default`
        : `${importName}[${JSON.stringify(exportName)}]`;
    return [
        `import * as ${importName} from ${JSON.stringify(reference.entrypoint)};`,
        `export async function ${functionName}(){`,
        `  const resolvedExport = ${exportLookup};`,
        "  if (resolvedExport == null) {",
        `    throw new Error(${JSON.stringify(`[caretcms] Could not resolve provider export "${reference.exportName ?? "default"}" from ${reference.entrypoint}.`)});`,
        "  }",
        "  return typeof resolvedExport === 'function'",
        `    ? await resolvedExport(${JSON.stringify(reference.options ?? null)})`,
        "    : resolvedExport;",
        "}",
    ].join("\n");
}
function createRuntimeProvidersPlugin(resolved, delivery) {
    const source = [
        buildProviderLoader("loadConfiguredStorage", resolved.storage),
        buildProviderLoader("loadConfiguredUploadHandler", resolved.uploads),
        buildProviderLoader("loadConfiguredIdentityAdapter", resolved.identity),
        buildProviderLoader("loadConfiguredDeploymentStatus", resolved.deployment),
        `export const allowedClasses = ${JSON.stringify(resolved.allowedClasses)};`,
        `export const delivery = ${JSON.stringify(delivery)};`,
        // Surfaced for the middleware's authenticated empty-state affordance: it
        // needs to know the inline editor is enabled and which paths are CMS-owned
        // (so the hint never shows inside the Studio / on API + asset routes).
        `export const enableInlineEditor = ${JSON.stringify(resolved.enableInlineEditor)};`,
        `export const mountPath = ${JSON.stringify(resolved.mountPath)};`,
        `export const apiBasePath = ${JSON.stringify(resolved.apiBasePath)};`,
    ].join("\n\n");
    return {
        name: "caretcms:runtime-providers",
        resolveId(id) {
            if (id === VIRTUAL_PROVIDER_MODULE_ID) {
                return RESOLVED_VIRTUAL_PROVIDER_MODULE_ID;
            }
            return null;
        },
        load(id) {
            if (id === RESOLVED_VIRTUAL_PROVIDER_MODULE_ID) {
                return source;
            }
            return null;
        },
    };
}
/** The content root Markdown storage manages, or null for other storage. */
function markdownContentRoot(storage, projectRoot) {
    if (!storage || storage.entrypoint !== MARKDOWN_STORAGE_ENTRYPOINT)
        return null;
    const configured = storage.options?.contentRoot;
    return typeof configured === "string" ? resolve(projectRoot, configured) : join(projectRoot, "src", "content");
}
/**
 * JSON Schemas Astro generates for each content collection
 * (`.astro/collections/<name>.schema.json`, written by `astro sync`). They give
 * the Studio real field types, enums, and defaults without a `schemas` option.
 * Collections without object properties (`z.any()`) are skipped.
 */
export function readAstroCollectionSchemas(dir) {
    const out = {};
    let files;
    try {
        files = readdirSync(dir);
    }
    catch {
        return out;
    }
    for (const file of files) {
        const match = /^(.+)\.schema\.json$/.exec(file);
        if (!match || !COLLECTION_NAME_RE.test(match[1]))
            continue;
        try {
            const parsed = JSON.parse(readFileSync(join(dir, file), "utf8"));
            // A `file()` collection's schema describes the whole file: an array of
            // entries or an object of them. Each entry is the array's item schema.
            const fileItems = Array.isArray(parsed.anyOf)
                ? parsed.anyOf.find((option) => option?.type === "array")?.items
                : undefined;
            const schema = fileItems?.type === "object" ? { $schema: parsed.$schema, ...fileItems } : parsed;
            const properties = schema.properties;
            if (schema.type !== "object" || !properties || Object.keys(properties).length === 0)
                continue;
            const { $schema: _draft, ...rest } = schema;
            const { $schema: _field, ...fields } = properties;
            if (Object.keys(fields).length === 0)
                continue;
            out[match[1]] = { ...rest, properties: fields };
        }
        catch {
            // A partial write during `astro sync` is retried on the next load.
        }
    }
    return out;
}
function createSchemasPlugin(schemas, collections, astroSchemasDir) {
    // Read when the module first loads, after Astro has synced its collections.
    const render = () => {
        const merged = { ...(astroSchemasDir ? readAstroCollectionSchemas(astroSchemasDir) : {}), ...schemas };
        const hasSchemas = Object.keys(merged).length > 0;
        const hasCollections = Object.keys(collections).length > 0;
        return hasSchemas || hasCollections
            ? [
                `import { registerCollectionSchema, registerCollectionStudioConfig } from "@caretcms/core/schema-registry";`,
                `import { buildTemplate } from "@caretcms/core/schema-utils";`,
                `const schemas = ${JSON.stringify(merged)};`,
                `const collections = ${JSON.stringify(collections)};`,
                `for (const [collection, schema] of Object.entries(schemas)) {`,
                `  registerCollectionSchema(collection, schema, buildTemplate(schema), collections[collection]);`,
                `}`,
                `for (const [collection, metadata] of Object.entries(collections)) {`,
                `  registerCollectionStudioConfig(collection, metadata);`,
                `}`,
                `export const registered = true;`,
            ].join("\n")
            : `export const registered = false;`;
    };
    return {
        name: "caretcms:schemas",
        resolveId(id) {
            if (id === VIRTUAL_SCHEMAS_MODULE_ID) {
                return RESOLVED_VIRTUAL_SCHEMAS_MODULE_ID;
            }
            return null;
        },
        load(id) {
            if (id === RESOLVED_VIRTUAL_SCHEMAS_MODULE_ID) {
                return render();
            }
            return null;
        },
    };
}
const RESERVED_WORDS = new Set(("await break case catch class const continue debugger default delete do else enum export extends " +
    "false finally for function if implements import in instanceof interface let new null package private protected public " +
    "return static super switch this throw true try typeof var void while with yield arguments eval").split(" "));
const ASTRO_CONTENT_BINDINGS_ID = "\0caretcms:astro-content";
const DATA_FILE_PREFIX = "\0caretcms:data-file:";
/** The `astro:content` a theme imports, with reads bound for editors. */
const ASTRO_CONTENT_BINDINGS_SOURCE = [
    `export * from "astro:content";`,
    `import * as content from "astro:content";`,
    `import { bindCollectionEntries, bindCollectionEntry } from "@caretcms/core/runtime";`,
    `export const getCollection = (...args) => content.getCollection(...args).then(bindCollectionEntries);`,
    `export const getEntry = (...args) => Promise.resolve(content.getEntry(...args)).then(bindCollectionEntry);`,
    `export const getEntries = (...args) => content.getEntries(...args).then(bindCollectionEntries);`,
].join("\n");
/**
 * Server-side only: theme imports of `astro:content` go through a module that
 * binds collection reads, and JSON files imported from the content root are
 * wrapped with `bindDataFile`. Astro's own modules, `content.config`,
 * `live.config`, and browser code keep the originals.
 */
function createContentBindingsPlugin(contentRoot, projectRoot) {
    /** Collection a JSON file belongs to: a configured `file()` source, or `<contentRoot>/<name>.json`. */
    const collectionOf = (file) => {
        const normalized = resolve(file);
        for (const [name, path] of contentConfigDataFiles(projectRoot))
            if (resolve(path) === normalized)
                return name;
        const name = basename(file, ".json");
        return contentRoot !== null && dirname(normalized) === resolve(contentRoot) && COLLECTION_NAME_RE.test(name) ? name : null;
    };
    return {
        name: "caretcms:content-bindings",
        enforce: "pre",
        // Ordered first: Astro's own plugin also resolves `astro:content`.
        resolveId: {
            order: "pre",
            async handler(source, importer, options) {
                if (!importer || importer.startsWith("\0") || importer.includes("/node_modules/"))
                    return null;
                if (this.environment?.config?.consumer === "client" || options?.ssr === false)
                    return null;
                if (source === "astro:content") {
                    // Collection config files define collections; Astro checks where
                    // `defineLiveCollection` is called from, so they get the original.
                    return /(?:content|live)\.config\.[cm]?[jt]s$/.test(importer) ? null : ASTRO_CONTENT_BINDINGS_ID;
                }
                if (!contentRoot || !/\.json(\?|$)/.test(source))
                    return null;
                const target = await this.resolve(source, importer, { skipSelf: true });
                if (!target || target.external)
                    return null;
                const file = target.id.split("?")[0];
                const name = target.id.includes("?") ? null : collectionOf(file);
                if (!name)
                    return null;
                // A `.js` suffix keeps Vite's JSON plugin from parsing the generated module;
                // the collection name rides along so a file elsewhere keeps its address.
                return `${DATA_FILE_PREFIX}${name}:${file}.js`;
            },
        },
        load(id) {
            if (id === ASTRO_CONTENT_BINDINGS_ID)
                return ASTRO_CONTENT_BINDINGS_SOURCE;
            if (!id.startsWith(DATA_FILE_PREFIX))
                return null;
            const target = id.slice(DATA_FILE_PREFIX.length, -".js".length);
            const separator = target.indexOf(":");
            const name = target.slice(0, separator);
            const file = target.slice(separator + 1);
            this.addWatchFile(file);
            const value = JSON.parse(readFileSync(file, "utf8"));
            const lines = [
                `import { bindDataFile } from "@caretcms/core/runtime";`,
                `const data = bindDataFile(${JSON.stringify(value)}, ${JSON.stringify(name)});`,
                `export default data;`,
            ];
            // Keep Vite's named exports for top-level keys (`import { nav } from …`).
            if (value && typeof value === "object" && !Array.isArray(value)) {
                for (const key of Object.keys(value)) {
                    if (/^[A-Za-z_$][\w$]*$/.test(key) && !RESERVED_WORDS.has(key))
                        lines.push(`export const ${key} = data[${JSON.stringify(key)}];`);
                }
            }
            return lines.join("\n");
        },
    };
}
function describeProvider(reference) {
    if (!reference)
        return "none";
    return `${reference.entrypoint}#${reference.exportName ?? "default"}`;
}
/** JSON for safe embedding inside an inline `<script>`: escape `<` so a config
 *  value containing `</script>` (or `<!--`) can't terminate or confuse the tag. */
function jsonForInlineScript(value) {
    return JSON.stringify(value).replace(/</g, "\\u003c");
}
function buildCloudBootstrapScript(clientConfig, cloud) {
    return [
        `window.__CARET__ = ${jsonForInlineScript(clientConfig)};`,
        `import { bootstrapCloudCms, hasCloudCmsSession, redirectToCloudCmsLogin } from "@caretcms/core/browser-runtime";`,
        `const __caretCloudConfig = ${jsonForInlineScript(cloud)};`,
        `bootstrapCloudCms(__caretCloudConfig).then(async () => {`,
        `  const url = new URL(window.location.href);`,
        `  const wantsEditor = url.searchParams.get("cms") === "1";`,
        `  if (hasCloudCmsSession(__caretCloudConfig)) {`,
        `    await import("@caretcms/core/editor-runtime");`,
        `    return;`,
        `  }`,
        `  if (wantsEditor) {`,
        `    redirectToCloudCmsLogin(__caretCloudConfig, window.location.href);`,
        `  }`,
        `}).catch((error) => {`,
        `  console.warn("[caretcms] Cloud runtime bootstrap failed.", error);`,
        "});",
    ].join("\n");
}
/**
 * Zero-config storage detection (Zod-free): does `<root>/src/content` hold any
 * Astro content-collection directories? Mirrors `listCollectionDirs` — a child
 * dir whose name passes the collection-id contract — so what we detect here is
 * exactly what `MarkdownAdapter.discoverCollections()` will later surface in the
 * Studio. A plain readdir, no `astro:content` import and no config eval, keeping
 * core's zero-runtime-dep / Zod-agnostic boundary intact.
 *
 * `content.config.ts` is a file, not a dir, so it's naturally excluded. Returns
 * the collection names (for the log line) or `[]` when src/content is absent.
 */
function detectContentCollections(rootDir) {
    const contentRoot = join(rootDir, "src", "content");
    try {
        return readdirSync(contentRoot, { withFileTypes: true })
            .filter((e) => e.isDirectory() && COLLECTION_NAME_RE.test(e.name))
            .map((e) => e.name)
            .sort((a, b) => a.localeCompare(b));
    }
    catch {
        // src/content absent or unreadable — not a content-collection site.
        return [];
    }
}
/**
 * Extend the active markdown pipeline with the CaretCMS body-stamping plugin.
 *
 * Astro 7's default processor is Sätteri — its `options.mdastPlugins` array is
 * the sanctioned extension point, and the default instance is created before
 * integration hooks run, so pushing onto it is honored (we never REPLACE
 * `markdown.processor`, whose merge is replace-not-append). Astro 6 and unified
 * holdouts fall through to a remark plugin via `updateConfig`.
 */
function injectMarkdownStamping(args) {
    const { config, updateConfig, logger, contentRoot } = args;
    const processor = config.markdown?.processor;
    if (processor?.name === "satteri" && processor.options) {
        (processor.options.mdastPlugins ??= []).push(caretSatteriPlugin({ contentRoot }));
        logger.info("Markdown body editing enabled (Sätteri mdast plugin).");
    }
    else {
        updateConfig({ markdown: { remarkPlugins: [[caretRemarkPlugin({ contentRoot }), { caretStampVersion: "paragraphs-v1" }]] } });
        logger.info("Markdown body editing enabled (remark plugin).");
    }
}
export function caret(options = {}) {
    const resolved = resolveCaretOptions(options);
    // Path prefixes the integration owns once its routes are injected; null until
    // (and unless) config:setup actually injects them (static output / cloud
    // variants skip injection). Read by the routes:resolved collision check.
    let ownedRoutePrefixes = null;
    let shouldBakeStaticOutput = false;
    let staticDevAuthoring = false;
    let effectiveDeliveryForBuild = null;
    return {
        name: "caretcms",
        hooks: {
            "astro:config:setup": ({ command, config, logger, addMiddleware, injectRoute, injectScript, updateConfig, addDevToolbarApp }) => {
                if (command === "dev" || command === "preview") {
                    loadCaretEnvFiles(fileURLToPath(config.root), command === "dev" ? "development" : "production");
                }
                const isStaticOutput = config.output === "static";
                assertDeliveryMatchesAstroOutput(resolved.delivery, config.output);
                const effectiveDelivery = resolveEffectiveDelivery(resolved.delivery, config.output);
                staticDevAuthoring = command === "dev" && isStaticOutput &&
                    resolved.mode === "embedded" && effectiveDelivery.mode === "static";
                effectiveDeliveryForBuild = effectiveDelivery;
                shouldBakeStaticOutput =
                    command === "build" &&
                        isStaticOutput &&
                        resolved.mode !== "cloud" &&
                        effectiveDelivery.mode === "static" &&
                        effectiveDelivery.bake;
                // A typo'd option (`mountpath`) used to silently fall back to its
                // default — the user "configured" something that never took effect.
                for (const unknown of unknownOptionWarnings(options)) {
                    logger.warn(`unknown option ${unknown} — ignored.`);
                }
                // Zero-config collection detection: when the user hasn't chosen a storage
                // adapter and the project has Astro content collections under src/content,
                // default to markdownStorage() so the Studio surfaces those collections
                // immediately instead of the "No collections yet" empty state. Skipped in
                // cloud mode (storage is remote) and whenever an explicit `storage` was
                // passed — setting `storage: filesystemStorage()` is the opt-out. This
                // only picks the adapter; typed field labels still come from `schemas`
                // (e.g. derived via @caretcms/zod), which stays opt-in to keep core
                // Zod-agnostic.
                const userSetStorage = isProviderReference(options.storage, "storage");
                if (!userSetStorage && resolved.mode !== "cloud") {
                    const projectRoot = fileURLToPath(config.root);
                    const detected = [...new Set([...detectContentCollections(projectRoot), ...contentConfigDataFiles(projectRoot).keys()])]
                        .sort((a, b) => a.localeCompare(b));
                    if (detected.length > 0) {
                        // Pin the adapter to the SAME root the detection used — its own
                        // default is process.cwd(), which diverges from config.root under
                        // `astro dev --root`, monorepo task runners, etc., producing
                        // "detected collections" in the log while the Studio reads an
                        // empty directory somewhere else.
                        resolved.storage = markdownStorage({
                            contentRoot: join(projectRoot, "src", "content"),
                            metaRoot: join(projectRoot, ".caretcms"),
                        });
                        logger.info(`Detected Astro content collections (${detected.join(", ")}) — defaulting storage to markdownStorage(). Pass an explicit \`storage\` to override; add \`schemas\` (e.g. via @caretcms/zod) for typed fields.`);
                    }
                }
                // Pages rendered without a request (static builds) read published
                // values through the configured storage; this loads it into page code.
                if (resolved.mode !== "cloud") {
                    injectScript("page-ssr", `import ${JSON.stringify(fileURLToPath(new URL("./runtime/build-storage.js", import.meta.url)))};`);
                }
                // Markdown storage reads `file()` collections from wherever the content
                // config says they live; paths there are relative to the project root.
                if (resolved.storage?.entrypoint === MARKDOWN_STORAGE_ENTRYPOINT && resolved.mode !== "cloud") {
                    const projectRoot = fileURLToPath(config.root);
                    const storageOptions = (resolved.storage.options ?? {});
                    if (typeof storageOptions.projectRoot !== "string") {
                        resolved.storage = { ...resolved.storage, options: { ...storageOptions, projectRoot } };
                    }
                    if (command === "dev") {
                        const contentRoot = markdownContentRoot(resolved.storage, projectRoot) ?? join(projectRoot, "src", "content");
                        const unreachable = uneditableCollections(projectRoot, contentRoot);
                        if (unreachable.length) {
                            logger.warn(`Can't edit ${unreachable.length === 1 ? "this collection" : "these collections"} yet: ${unreachable.join("; ")}.`);
                        }
                    }
                }
                // Markdown body editing: stamp rendered prose blocks with
                // `data-caret-md` bindings by extending the active markdown pipeline.
                // Runs after zero-config detection so an auto-selected markdown adapter
                // is covered too. Gated on markdown storage + embedded + `bodyEditing`.
                if (resolved.bodyEditing &&
                    resolved.mode !== "cloud" &&
                    resolved.storage?.entrypoint === MARKDOWN_STORAGE_ENTRYPOINT) {
                    const projectRoot = fileURLToPath(config.root);
                    const configuredRoot = resolved.storage.options
                        ?.contentRoot;
                    // The adapter resolves a relative contentRoot against cwd; the stamp
                    // plugin compares against absolute file URLs, so resolve it against
                    // the project root here (resolve() leaves an absolute root as-is).
                    const contentRoot = configuredRoot
                        ? resolve(projectRoot, configuredRoot)
                        : join(projectRoot, "src", "content");
                    injectMarkdownStamping({ config, updateConfig, logger, contentRoot });
                }
                // Zero-config dev login: when running `astro dev` in an editable
                // (embedded, server-output) setup with no real password configured,
                // mint a throwaway password so a freshly-installed site can sign in
                // immediately. Only generated for `command === "dev"`, so production
                // builds bake an empty define and stay locked.
                const hasEnvPassword = (process.env.CARET_EDIT_PASSWORD ?? process.env.EDIT_PASSWORD ?? "").trim()
                    .length > 0;
                const devEditorPassword = command === "dev" &&
                    (!isStaticOutput || effectiveDelivery.mode === "static") &&
                    resolved.mode !== "cloud" &&
                    !hasEnvPassword
                    ? devPasswordFile(fileURLToPath(config.root))
                    : null;
                // Markdown storage owns src/content: its JSON files are data
                // collections, and Astro's generated schemas describe its collections.
                const contentRoot = markdownContentRoot(resolved.storage, fileURLToPath(config.root));
                const astroSchemasDir = contentRoot ? fileURLToPath(new URL(".astro/collections/", config.root)) : null;
                updateConfig({
                    vite: {
                        define: {
                            __ASTRO_CARET_MOUNT_PATH__: JSON.stringify(resolved.mountPath),
                            __ASTRO_CARET_API_BASE_PATH__: JSON.stringify(resolved.apiBasePath),
                            __ASTRO_CARET_EDITOR_HOME__: JSON.stringify(resolved.editorHome),
                            __ASTRO_CARET_INLINE_EDITOR__: JSON.stringify(resolved.enableInlineEditor),
                            __ASTRO_CARET_BIND_CONTENT__: JSON.stringify(resolved.bindContent && resolved.enableInlineEditor),
                            __ASTRO_CARET_MODE__: JSON.stringify(resolved.mode),
                            __ASTRO_CARET_THEME_CONFIG__: JSON.stringify(JSON.stringify(resolved.theme)),
                            __ASTRO_CARET_BRAND_CONFIG__: JSON.stringify(JSON.stringify(resolved.brand)),
                            __ASTRO_CARET_LOCALE__: JSON.stringify(resolved.locale),
                            __ASTRO_CARET_DICTIONARY__: JSON.stringify(JSON.stringify(resolved.dictionary)),
                            __ASTRO_CARET_DEV_PASSWORD__: JSON.stringify(devEditorPassword?.password ?? ""),
                            // Authoritative dev signal for the auth layer: the public fallback
                            // session secret is honored only when this is true. Baked false in
                            // production builds so a no-password deployment can't be unlocked
                            // with a forged, publicly-signed session (see auth/session.ts).
                            __ASTRO_CARET_DEV__: JSON.stringify(command === "dev"),
                        },
                        plugins: [
                            createRuntimeProvidersPlugin(resolved, effectiveDelivery),
                            ...(command === "dev" ? [createSelfWriteReloadPlugin()] : []),
                            createSchemasPlugin(resolved.schemas, resolved.collections, astroSchemasDir),
                            createPageContentPlugin(fileURLToPath(new URL("./src/", config.root))),
                            ...(resolved.bindContent && resolved.enableInlineEditor
                                ? [createContentBindingsPlugin(contentRoot, fileURLToPath(config.root))]
                                : []),
                        ],
                    },
                });
                const clientConfig = {
                    mode: resolved.mode,
                    mountPath: resolved.mountPath,
                    apiBasePath: resolved.apiBasePath,
                    cloud: resolved.cloud ?? undefined,
                    allowedClasses: resolved.allowedClasses,
                    delivery: { mode: effectiveDelivery.mode },
                };
                // Dev Toolbar app: a login-free, dev-only view of the data-caret
                // bindings on the current page — the complement to the in-editor
                // "Show All" button, which needs an authenticated editor session.
                // Registered for every mode/output (it's pure introspection and is
                // useful even in static mode); only runs under `astro dev`, so it
                // adds no production surface.
                if (command === "dev") {
                    addDevToolbarApp({
                        id: "caretcms",
                        name: "CaretCMS",
                        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
                        entrypoint: new URL("../static/cms/dev-toolbar/app.js", import.meta.url),
                    });
                    // mountPath/apiBasePath for the toolbar's Studio deep-links. Unlike
                    // window.__CARET__ (set only after auth), this is always present in
                    // dev so the toolbar can build links before anyone signs in.
                    injectScript("page", `window.__CARET_DEV__=${JSON.stringify({ mountPath: resolved.mountPath, apiBasePath: resolved.apiBasePath })};`);
                }
                if (resolved.mode === "cloud") {
                    injectScript("page", buildCloudBootstrapScript(clientConfig, resolved.cloud));
                    logger.warn("mode: 'cloud' is alpha. The hosted control plane is not yet generally available — bootstrap requests will fail silently against placeholder endpoints. Use embedded mode for production today.");
                    logger.info(`cloud mode loaded (projectId=${resolved.cloud.projectId}, endpoint=${resolved.cloud.endpoint}, static=${isStaticOutput})`);
                    return;
                }
                if (isStaticOutput) {
                    if (effectiveDelivery.mode === "static") {
                        if (command !== "dev") {
                            logger.info(`static delivery enabled (bake=${effectiveDelivery.bake}) — authoring routes stay out of production static output; generated HTML is baked at build end.`);
                            return;
                        }
                        logger.info("static delivery dev authoring enabled — injecting editor/API routes for local preview; production builds bake static HTML.");
                    }
                    else {
                        logger.warn(`delivery: "server" needs Astro output: "server" plus an SSR adapter for local editing routes. Static output detected, so embedded CMS middleware and routes were skipped. Use delivery: "auto" or "static" to bake HTML for a static site.`);
                        return;
                    }
                }
                addMiddleware({
                    order: "pre",
                    entrypoint: new URL("./runtime/middleware.js", import.meta.url),
                });
                ownedRoutePrefixes = [
                    ...(resolved.enableAdmin ? [resolved.mountPath] : []),
                    resolved.apiBasePath,
                    "/__caret",
                ];
                if (resolved.enableAdmin) {
                    injectRoute({
                        pattern: resolved.mountPath,
                        entrypoint: new URL("./runtime/routes/admin.js", import.meta.url),
                    });
                    injectRoute({
                        pattern: `${resolved.mountPath}/cms`,
                        entrypoint: new URL("./runtime/routes/studio-home.js", import.meta.url),
                    });
                    injectRoute({
                        pattern: `${resolved.mountPath}/cms/[collection]`,
                        entrypoint: new URL("./runtime/routes/collection-list.js", import.meta.url),
                    });
                    injectRoute({
                        pattern: `${resolved.mountPath}/cms/[collection]/[id]`,
                        entrypoint: new URL("./runtime/routes/admin-entry.js", import.meta.url),
                    });
                }
                injectRoute({
                    pattern: `${resolved.apiBasePath}/entries`,
                    entrypoint: new URL("./runtime/routes/entries.js", import.meta.url),
                });
                injectRoute({
                    pattern: `${resolved.apiBasePath}/mutate`,
                    entrypoint: new URL("./runtime/routes/mutate.js", import.meta.url),
                });
                injectRoute({
                    pattern: `${resolved.apiBasePath}/schema`,
                    entrypoint: new URL("./runtime/routes/schema.js", import.meta.url),
                });
                injectRoute({
                    pattern: `${resolved.apiBasePath}/publish`,
                    entrypoint: new URL("./runtime/routes/publish.js", import.meta.url),
                });
                injectRoute({
                    pattern: `${resolved.apiBasePath}/draft`,
                    entrypoint: new URL("./runtime/routes/draft.js", import.meta.url),
                });
                injectRoute({
                    pattern: `${resolved.apiBasePath}/deployment`,
                    entrypoint: new URL("./runtime/routes/deployment.js", import.meta.url),
                });
                injectRoute({
                    pattern: `${resolved.apiBasePath}/collections-metadata`,
                    entrypoint: new URL("./runtime/routes/collections-metadata.js", import.meta.url),
                });
                injectRoute({
                    pattern: `${resolved.apiBasePath}/auth/login`,
                    entrypoint: new URL("./runtime/routes/auth-login.js", import.meta.url),
                });
                injectRoute({
                    pattern: `${resolved.apiBasePath}/auth/session`,
                    entrypoint: new URL("./runtime/routes/auth-session.js", import.meta.url),
                });
                injectRoute({
                    pattern: `${resolved.apiBasePath}/auth/logout`,
                    entrypoint: new URL("./runtime/routes/auth-logout.js", import.meta.url),
                });
                injectRoute({
                    pattern: `${resolved.apiBasePath}/theme.css`,
                    entrypoint: new URL("./runtime/routes/theme-stylesheet.js", import.meta.url),
                });
                injectRoute({
                    pattern: `${resolved.apiBasePath}/history`,
                    entrypoint: new URL("./runtime/routes/history.js", import.meta.url),
                });
                injectRoute({
                    pattern: `${resolved.apiBasePath}/upload`,
                    entrypoint: new URL("./runtime/routes/upload.js", import.meta.url),
                });
                if (resolved.enableInlineEditor) {
                    injectRoute({
                        pattern: "/__caret/[...path]",
                        entrypoint: new URL("./runtime/routes/editor-assets.js", import.meta.url),
                    });
                    injectScript("page", `(function(){
  // Bootstrap when the page has an explicit data-caret / data-caret-md binding
  // OR stega-encoded content (key hidden in a string via U+E0000); the latter
  // has no attribute until the editor hydrates it, so attribute-only detection
  // would miss it.
  // A Studio link opened in a tab arrives as #caret-studio=<route>: load the
  // editor so the Studio opens over this page, bindings or not.
  // With Astro view transitions the first page may have nothing to edit; each
  // client-side navigation checks again until the editor has loaded.
  var started=false;
  function start(){
    if(started)return;
    if(!document.querySelector('[data-caret],[data-caret-md]') && !/\\u{E0000}/u.test(document.body&&document.body.textContent||'') && location.hash.indexOf('#caret-studio=')!==0)return;
    started=true;
    fetch(${JSON.stringify(`${resolved.apiBasePath}/auth/session`)},{credentials:'same-origin'})
      .then(function(response){return response.ok?response.json():null;})
      .then(function(session){
        if(!session||session.authenticated!==true)return;
        var l=document.createElement('link');l.rel='stylesheet';l.href='/__caret/editor.css';l.setAttribute('data-caret-editor','');document.head.appendChild(l);
        window.__CARET__=${jsonForInlineScript(clientConfig)};
        window.__CARET__.draftMode=session.draftMode===true;
        var s=document.createElement('script');s.type='module';s.src='/__caret/editor.js?v='+Date.now();document.head.appendChild(s);
      })
      .catch(function(){ started=false; });
  }
  start();
  document.addEventListener('astro:page-load',start);
})();`);
                }
                logger.info(`core loaded (mode=${resolved.mode}, mountPath=${resolved.mountPath}, apiBasePath=${resolved.apiBasePath}, storage=${describeProvider(resolved.storage)}, uploads=${describeProvider(resolved.uploads)}, enableAdmin=${resolved.enableAdmin}, inlineEditor=${resolved.enableInlineEditor})`);
                if (devEditorPassword) {
                    logger.warn(`No CARET_EDIT_PASSWORD set — temporary dev login enabled so you can sign in now:\n` +
                        `\n` +
                        `    password: ${devEditorPassword.password}  (kept in ${DEV_PASSWORD_PATH})\n` +
                        `\n` +
                        `  Sign in at ${resolved.mountPath}. To set your own, add\n` +
                        `  CARET_EDIT_PASSWORD=<your-password> to a .env file and restart.\n` +
                        `  This temporary password works in dev only; production stays locked.`);
                }
            },
            "astro:server:setup": ({ server }) => {
                if (!staticDevAuthoring)
                    return;
                server.middlewares.use((request, _response, next) => withDevRequest(request, next));
            },
            // Type the middleware's contribution to Astro.locals so user code gets
            // `locals.isEditor: boolean` with autocomplete instead of `any`.
            "astro:config:done": ({ injectTypes }) => {
                injectTypes({
                    filename: "types.d.ts",
                    content: [
                        "declare namespace App {",
                        "  interface Locals {",
                        "    /** True when the request carries an authenticated CaretCMS editor session (set by the caretcms middleware). */",
                        "    isEditor: boolean;",
                        "  }",
                        "}",
                        "",
                    ].join("\n"),
                });
            },
            "astro:build:done": async ({ dir, logger }) => {
                if (!shouldBakeStaticOutput)
                    return;
                if (effectiveDeliveryForBuild?.mode !== "static")
                    return;
                const adapter = await loadProviderReference(resolved.storage);
                if (!adapter) {
                    logger.warn("static delivery bake skipped: no storage provider configured.");
                    return;
                }
                const result = await bakeStaticHtmlFiles(dir, {
                    adapter,
                    allowedClasses: resolved.allowedClasses,
                });
                logger.info(`static delivery bake complete (${result.rewritten}/${result.scanned} HTML files rewritten).`);
            },
            // An existing site may already own a route under /admin or /api/cms —
            // Astro resolves the conflict by file-vs-injected precedence, which
            // silently shadows either the user's page or the CMS login. Name the
            // overlap and the remedy instead of letting it read as "CMS is broken".
            "astro:routes:resolved": ({ routes, logger }) => {
                if (!ownedRoutePrefixes)
                    return; // nothing injected (static/cloud skip)
                const owned = ownedRoutePrefixes;
                for (const route of routes) {
                    if (route.origin !== "project")
                        continue;
                    const hit = owned.find((p) => route.pattern === p || route.pattern.startsWith(`${p}/`));
                    if (!hit)
                        continue;
                    logger.warn(`your route ${route.pattern} (${route.entrypoint}) overlaps the CMS route space "${hit}" — one of them will be shadowed. ` +
                        `Move your route, or relocate the CMS with caret({ ${hit === resolved.apiBasePath ? 'apiBasePath: "/your-api-path"' : 'mountPath: "/your-admin-path"'} }).`);
                }
            },
        },
    };
}
export default caret;
/** Where dev keeps its temporary password, relative to the project root. */
const DEV_PASSWORD_PATH = ".caret/dev-password";
/**
 * The temporary dev password, kept in `.caret/dev-password` so it survives
 * restarts and can be found without the dev server's output (Astro 7 runs
 * `astro dev` in the background). The folder's own .gitignore keeps it out of
 * commits.
 */
function devPasswordFile(root) {
    const file = join(root, DEV_PASSWORD_PATH);
    try {
        const kept = readFileSync(file, "utf8").trim();
        if (/^[a-f0-9]{8,}$/.test(kept))
            return { password: kept };
    }
    catch {
        // Not created yet.
    }
    const password = randomBytes(4).toString("hex");
    try {
        const dir = dirname(file);
        mkdirSync(dir, { recursive: true });
        writeFileSync(file, `${password}\n`, { mode: 0o600 });
        const ignore = join(dir, ".gitignore");
        const ignored = existsSync(ignore) ? readFileSync(ignore, "utf8") : "";
        if (!ignored.split(/\r?\n/).includes("dev-password")) {
            writeFileSync(ignore, `${ignored}${ignored && !ignored.endsWith("\n") ? "\n" : ""}dev-password\n`);
        }
    }
    catch {
        // A read-only project still gets a password for this run.
    }
    return { password };
}
//# sourceMappingURL=index.js.map