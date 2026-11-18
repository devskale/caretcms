/**
 * Where an Astro project's content collections load from, read from its
 * content config (`src/content.config.{ts,mts,js,mjs}`, or the legacy
 * `src/content/config.*`).
 *
 * Markdown storage maps `<contentRoot>/<collection>/` and
 * `<contentRoot>/<collection>.json` on its own; a `file()` collection can live
 * anywhere (`file("src/data/menu.json")`). Only the config says where, so this
 * reads it.
 *
 * Why the source and not Astro's generated `.astro/data-store.json`: the data
 * store records a `filePath` per entry, so an empty collection has no path, it
 * does not exist until the first sync (after integrations are set up), and it
 * can be stale. The config is the user's own declaration and is there from the
 * first run.
 *
 * The reader is a small tokenizer, not an evaluator: it finds
 * `defineCollection({ loader: file("…") })` and `glob({ base: "…" })` calls with
 * literal paths, the variable or key each is bound to, and the key each
 * variable gets in `export const collections = { … }`. Anything it cannot read
 * literally is reported as `other`, never guessed.
 */
export type ContentConfigCollection = {
    name: string;
    loader: "file";
    path: string;
    parser: boolean;
} | {
    name: string;
    loader: "glob";
    base: string | null;
} | {
    name: string;
    loader: "other";
};
/** The project's content config file, or null when it has none. */
export declare function findContentConfig(projectRoot: string): string | null;
/**
 * The collections declared in the project's content config, or null when there
 * is no config or its `collections` export can't be read. Cached per config
 * file modification time, so an edited config is picked up without a restart.
 */
export declare function readContentConfig(projectRoot: string): ContentConfigCollection[] | null;
/** `file()` collections whose source is a JSON file: collection name → absolute path. */
export declare function contentConfigDataFiles(projectRoot: string): Map<string, string>;
/**
 * The collections a content config declares, or null when it has no readable
 * `export const collections = { … }`.
 */
export declare function parseContentConfig(raw: string, projectRoot: string): ContentConfigCollection[] | null;
/**
 * Collections declared in the content config that Markdown storage can't map
 * to a source it edits, each with the reason, for the dev log.
 */
export declare function uneditableCollections(projectRoot: string, contentRoot: string): string[];
//# sourceMappingURL=content-config.d.ts.map