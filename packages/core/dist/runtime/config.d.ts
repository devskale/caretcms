import type { CaretMode } from "../types.js";
import { type ResolvedStudioDictionary, type StudioLocale } from "./i18n.js";
export type CaretBrandConfig = {
    name: string;
    logo: string | null;
    faviconUrl: string | null;
};
export type CaretThemeConfig = {
    presetId: string | null;
    tokenOverrides: Record<string, string>;
};
export type CaretRuntimeConfig = {
    mountPath: string;
    apiBasePath: string;
    editorHome: string;
    mode: CaretMode;
    theme: CaretThemeConfig;
    brand: CaretBrandConfig;
    locale: StudioLocale;
    messages: ResolvedStudioDictionary;
    /** The Studio opens over the site's pages (in the editor's drawer). */
    inlineEditor: boolean;
};
export declare function normalizePath(input: string | undefined, fallback: string): string;
export declare function getRuntimeConfig(): CaretRuntimeConfig;
//# sourceMappingURL=config.d.ts.map