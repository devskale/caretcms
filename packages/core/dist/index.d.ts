import type { AstroIntegration } from "astro";
import type { CaretStorageProvider, CaretUploadProvider, CollectionStudioConfig, CaretIdentityProvider, CaretDeploymentProvider } from "./types.js";
import { type StudioDictionary, type StudioLocale } from "./runtime/i18n.js";
import type { GitHubDeploymentOptions } from "./providers/deployment/github.js";
export type { StorageAdapter, UploadHandler, UploadContext, EntryData, EntrySnapshot, DraftBaseline, DraftGuard, DraftSnapshot, DraftCoordinator, StorageGuarantees, PublicationSourceSnapshot, HistoryEntry, RebuildReceipt, GitJournalTarget, GitJournalReceipt, EntryCommit, EntryCommitResult, CollectionMetadata, CollectionSchema, CollectionStudioConfig, CaretIdentityProvider, CaretDeploymentProvider, DeploymentStatusProvider, DeploymentStatusEvidence, DeploymentState, DeploymentTarget, IdentityAdapter, AuthorizationPolicy, AuthorizationAction, AuthorizationRequest, EditorIdentity, CaretMode, CaretStorageProvider, CaretUploadProvider, RuntimeProviderReference, } from "./types.js";
export type { StudioDictionary, StudioLocale, StudioMessageKey } from "./runtime/i18n.js";
export type { GitHubDeploymentOptions } from "./providers/deployment/github.js";
export { FilesystemAdapter } from "./runtime/storage/filesystem-adapter.js";
export { MarkdownAdapter } from "./runtime/storage/markdown-adapter.js";
export { InMemoryAdapter } from "./runtime/storage/in-memory-adapter.js";
export { FilesystemUploadHandler } from "./runtime/storage/filesystem-upload-handler.js";
export { bindEntry } from "./runtime/bind.js";
export { caretLoader, CaretLoaderError } from "./loader.js";
export type { CaretLiveLoader } from "./loader.js";
export { editable } from "./editable.js";
export { stegaClean } from "./runtime/stega.js";
type ProviderDefinitionOptions = {
    entrypoint: string;
    exportName?: string;
    options?: Record<string, unknown> | null;
};
export interface CaretCloudOptions extends Record<string, unknown> {
    endpoint: string;
    projectId: string;
    contentPath?: string;
    publicToken?: string;
    environment?: string;
}
type JsonSchemaDefinition = Record<string, unknown>;
export type CaretThemeOption = string | {
    preset?: string;
    tokens?: Record<string, string>;
};
export type CaretBrandOption = {
    name?: string;
    logo?: string;
    faviconUrl?: string;
};
type BaseCaretOptions = {
    mountPath?: string;
    apiBasePath?: string;
    enableAdmin?: boolean;
    enableInlineEditor?: boolean;
    /**
     * Make content read as data editable on the page: `getCollection()` /
     * `getEntry()` results and JSON files imported from the content root carry
     * their storage address during an editor's request. Visitors are unaffected.
     * Default true; set false if a theme compares content strings in ways the
     * built-in rules do not anticipate.
     */
    bindContent?: boolean;
    /**
     * The page the editor lands on after a successful login. Must be an
     * absolute, same-origin path (starts with a single `/`). An explicit
     * `?redirect=` on the login URL always takes precedence. Defaults to `"/"`
     * so the user lands on a live page with the inline editor active rather
     * than the empty Studio shell.
     *
     * @example caret({ editorHome: "/blog" })
     */
    editorHome?: string;
    /**
     * Optional collection schemas as JSON Schema objects. When provided, Studio
     * uses these for field labels, types, and validation instead of inferring
     * schema from the first entry.
     *
     * Keys are collection names, values are JSON Schema objects (e.g. produced
     * by z.toJSONSchema() from a Zod schema).
     */
    schemas?: Record<string, JsonSchemaDefinition>;
    /** Studio labels, ordering, and mutation capabilities by collection. */
    collections?: Record<string, CollectionStudioConfig>;
    /** Fixed Studio chrome language. Spanish and English ship with core. */
    locale?: StudioLocale;
    /** Per-message overrides applied after the selected first-party locale. */
    dictionary?: StudioDictionary;
    /**
     * Per-tag class allowlist for rich-text (`data-caret-rich`) fields. By default
     * the rich-text sanitizer strips every `class` (keeping only semantic inline
     * tags), so design-system classes inside editable content are lost on save.
     * Use this to bless specific classes so they round-trip unchanged.
     *
     * Keys are tag names, values are allowed class names. A pattern ending in `*`
     * is a prefix match (`"text-*"` allows `text-primary`); a lone `"*"` allows any
     * class on that tag. Example: `{ strong: ["text-theme-text-primary"], a: ["cta"] }`.
     *
     * Prefer styling semantic tags via CSS over allowlisting classes; reach for
     * this only when a specific class genuinely must live inside editable content.
     */
    allowedClasses?: Record<string, string[]>;
    /**
     * Inline editing of the markdown BODY (prose blocks) for entries served from
     * markdown storage. When on (the default with markdown storage), rendered
     * paragraphs, headings, and list items on the page are stamped with
     * `data-caret-md` bindings so they can be edited in place and published back
     * to the source `.md` file. Set `false` to disable the render-time stamping.
     * No effect on non-markdown storage or cloud mode.
     */
    bodyEditing?: boolean;
    /**
     * Delivery target for embedded CaretCMS content. The default is "auto":
     * Astro static output bakes stored content into generated HTML during
     * `astro build`, while Astro server output rewrites HTML per request with
     * middleware. Explicit "static"/"server" remain available when you want the
     * integration to validate that Astro's output matches your chosen delivery.
     */
    delivery?: "auto" | "server" | "static" | {
        mode?: "auto" | "server" | "static";
        /**
         * Whether `astro build` should rewrite generated HTML with stored
         * CaretCMS values. Defaults to true for effective static delivery.
         */
        bake?: boolean;
        publish?: {
            /**
             * Optional rebuild/deploy webhook called after a successful publish.
             * The publish remains committed if this webhook fails.
             */
            webhookUrl?: string;
            timeoutMs?: number;
            method?: "POST" | "PUT";
            headers?: Record<string, string>;
        };
    };
    /**
     * Studio chrome theme. Defaults to 'studio' — a neutral dark chrome that
     * matches the inline editor's "click to edit" blue. Currently the only
     * built-in preset; pass `{ tokens: { ... } }` to override individual
     * `--color-theme-*` / `--font-theme-*` values without forking the preset.
     */
    theme?: CaretThemeOption;
    /**
     * Branding shown in the studio chrome (header brand mark, login title,
     * favicon).
     */
    brand?: CaretBrandOption;
};
export type CaretOptions = (BaseCaretOptions & {
    mode?: "embedded";
    storage?: CaretStorageProvider;
    uploads?: CaretUploadProvider;
    identity?: CaretIdentityProvider;
    deployment?: CaretDeploymentProvider;
    cloud?: never;
}) | (BaseCaretOptions & {
    mode: "cloud";
    cloud: CaretCloudOptions;
    storage?: never;
    uploads?: never;
    identity?: never;
    deployment?: never;
});
export declare function defineStorageProvider(options: ProviderDefinitionOptions): CaretStorageProvider;
export declare function defineUploadProvider(options: ProviderDefinitionOptions): CaretUploadProvider;
export declare function defineIdentityProvider(options: ProviderDefinitionOptions): CaretIdentityProvider;
export declare function defineDeploymentProvider(options: ProviderDefinitionOptions): CaretDeploymentProvider;
/** Deterministic local deployment status provider for development and tests. */
export declare function simulatedDeployment(options?: {
    durationMs?: number;
    result?: "live" | "failed";
}): CaretDeploymentProvider;
/** GitHub Deployments status provider for deployment pipelines that preserve Caret metadata. */
export declare function githubDeployment(options: GitHubDeploymentOptions): CaretDeploymentProvider;
export declare function filesystemStorage(options?: {
    dataRoot?: string;
    metaRoot?: string;
}): CaretStorageProvider;
export declare function markdownStorage(options?: {
    contentRoot?: string;
    metaRoot?: string;
}): CaretStorageProvider;
export declare function localUploads(options?: {
    uploadsDir?: string;
}): CaretUploadProvider;
/**
 * `astro dev` and `astro preview` expose `.env` values to `import.meta.env`
 * only, but CaretCMS reads its server settings (session secret, edit password)
 * from `process.env`. Load `CARET_*` keys from the project's env files, in
 * Vite's order (`.env`, `.env.local`, `.env.<mode>`, `.env.<mode>.local`, later
 * wins), without overriding anything already set in the real environment.
 */
export declare function loadCaretEnvFiles(root: string, mode: string, env?: NodeJS.ProcessEnv): string[];
/**
 * JSON Schemas Astro generates for each content collection
 * (`.astro/collections/<name>.schema.json`, written by `astro sync`). They give
 * the Studio real field types, enums, and defaults without a `schemas` option.
 * Collections without object properties (`z.any()`) are skipped.
 */
export declare function readAstroCollectionSchemas(dir: string): Record<string, JsonSchemaDefinition>;
export declare function caret(options?: CaretOptions): AstroIntegration;
export default caret;
//# sourceMappingURL=index.d.ts.map