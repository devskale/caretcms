/**
 * Shared HTML chrome for studio pages (overview, collection list, entry editor).
 * Renders the document, theme stylesheets, the collection sidebar, the top bar
 * with breadcrumbs and search, the command palette, and the page body.
 */
import type { CaretRuntimeConfig } from "../config.js";
export declare function escapeHtml(value: string): string;
/** Serialize trusted configuration for an inline script without allowing a
 * `</script>` sequence to terminate the surrounding element. */
export declare function serializeJsonForScript(value: unknown): string;
export type Crumb = {
    label: string;
    href?: string;
};
export type StudioNavItem = {
    name: string;
    label: string;
    href: string;
    icon?: string;
    selected?: boolean;
    /** The palette's "New …" action, when the editor may add entries here. */
    create?: {
        label: string;
        href: string;
    };
};
export type StudioLayoutOptions = {
    runtime: CaretRuntimeConfig;
    title: string;
    breadcrumb?: Crumb[];
    /** Every Studio collection, for the sidebar and the command palette. */
    navigation?: StudioNavItem[];
    body: string;
    /** Extra inline <style> block for page-specific tweaks. */
    extraStyles?: string;
    /** Inline <script> body executed at end of <body>. */
    inlineScript?: string;
    /** The page's first Tab stop; defaults to skipping to the main content. */
    skipLink?: {
        label: string;
        href: string;
    };
    /** The site page this screen opens over when loaded outside the drawer; defaults to `editorHome`. */
    sitePath?: string;
    /** The site page failed for the editor (its status): the Studio stays here and says so. */
    siteError?: number | null;
};
export declare function humanizeCollection(name: string): string;
export declare function renderIcon(key: string, className?: string): string;
/** A configured collection icon, or one inferred from the collection name. */
export declare function renderCollectionIcon(icon: string | undefined, name: string, className?: string): string;
export declare function renderStudioPage(opts: StudioLayoutOptions): string;
export declare function htmlResponse(content: string, status?: number): Response;
/** How a Studio route reaches the site page it opens over. */
export declare const STUDIO_HANDOFF = "#caret-studio=";
/** Where a Studio page renders: over its site page, or here (with why). */
export type StudioPlacement = {
    redirect: Response;
} | {
    siteError: number | null;
};
/**
 * The Studio lives over the site, in the editor's drawer. A Studio page opened
 * in a tab of its own (a bookmark, a typed URL, the dev toolbar) sends the
 * browser to `sitePath` with the Studio open on this route, expanded. Pages
 * loaded inside the drawer are frames and render as usual. Without the inline
 * editor there is no drawer, so the Studio stays a page.
 *
 * The site page is loaded first, as the editor would see it: when it fails
 * (a saved change can break a page for editors only), the Studio renders here
 * with the reason, so the editor can undo the change instead of being sent to
 * an error page with no way back.
 */
export declare function placeStudio(context: {
    request: Request;
    url: URL;
}, runtime: CaretRuntimeConfig, sitePath?: string): Promise<StudioPlacement>;
export declare function redirectResponse(location: string): Response;
//# sourceMappingURL=studio-layout.d.ts.map