import type { StorageAdapter } from "../types.js";
export interface StaticBakeOptions {
    adapter: StorageAdapter;
    allowedClasses?: Record<string, readonly string[]>;
}
export interface StaticBakeFileResult {
    path: string;
    rewritten: boolean;
}
export interface StaticBakeResult {
    scanned: number;
    rewritten: number;
    files: StaticBakeFileResult[];
}
/**
 * Remove CaretCMS's binding attributes from built HTML. A static build has no
 * editor (it runs only in `astro dev`), so visitors' pages don't need them.
 * Only real tags are touched; raw text, comments and attribute values stay as
 * they are (see `scanHtmlTags`).
 */
export declare function stripBindingAttributes(html: string): string;
export declare function bakeStaticHtmlString(html: string, options: StaticBakeOptions): Promise<{
    html: string;
    rewritten: boolean;
}>;
export declare function bakeStaticHtmlFiles(root: string | URL, options: StaticBakeOptions): Promise<StaticBakeResult>;
//# sourceMappingURL=static-bake.d.ts.map