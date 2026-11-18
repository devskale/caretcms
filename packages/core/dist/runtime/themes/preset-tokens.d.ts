/**
 * Studio chrome theme tokens.
 *
 * Only one preset ships with core: `studio`, a neutral chrome with the inline
 * editor's "click to edit" blue. It has a dark and a light variant; the Studio
 * follows the operating system unless the editor picks one. Distributable site
 * themes live in separate packages (e.g. @caretcms/theme-*), not here.
 *
 * The values below populate the --color-theme-* / --font-theme-* tokens
 * declared in static/cms/studio-tokens.css. The studio-* aliases inherit
 * automatically.
 */
export type ThemeTokens = Record<string, string>;
export type ThemeModes = {
    dark: ThemeTokens;
    light: ThemeTokens;
};
export declare const DEFAULT_PRESET_ID = "studio";
export declare function getPresetModes(themeId: string): ThemeModes;
//# sourceMappingURL=preset-tokens.d.ts.map