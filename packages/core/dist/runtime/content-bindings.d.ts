/**
 * Automatic bindings for content a theme reads as data.
 *
 * Most themes keep their copy in content collections or JSON files and pass it
 * through helpers, loops, and component props, so no element in the source
 * says where a string is stored. During an editor's request the values carry
 * that address themselves: each display string is stega-encoded with its
 * `collection::id::field` key (as `editable()` does by hand), and the
 * editor's drafts are overlaid so a reload shows them.
 *
 * - `bindCollectionEntries` / `bindCollectionEntry` wrap `astro:content`
 *   reads. The integration routes theme imports of `astro:content` through a
 *   module that applies them.
 * - `bindDataFile` wraps a JSON file imported from the content root.
 *
 * Only entries the storage adapter can resolve are bound, so a key always
 * points at something an edit can be saved to. Visitors get values untouched.
 */
import type { StorageAdapter } from "../types.js";
export declare function bindCollectionEntry<T>(entry: T): Promise<T>;
export declare function bindCollectionEntries<T>(entries: T): Promise<T>;
/**
 * Bind content entries a page receives as props (`getStaticPaths` →
 * `Astro.props.post`). Astro resolves those props before middleware runs and
 * caches `getStaticPaths` results, so they never pass through a bound
 * `getCollection()` during the editor's request. Astro gives each request its
 * own shallow copy of the props, so replacing a prop here reaches only this
 * render; the cached entries are never changed.
 */
export declare function bindPageProps(props: Record<string, unknown> | null | undefined): Promise<void>;
/**
 * Read every data-file collection's stored entries for an editor request.
 * Imported data files are read synchronously during render, so their drafts
 * must be loaded before it starts.
 */
export declare function loadDataFileEntries(adapter: StorageAdapter): Promise<Map<string, Map<string, Record<string, unknown>>>>;
/**
 * Wrap a data file imported from the content root (`import site from
 * "../content/site.json"`). Theme modules usually keep the import in a
 * module-level constant, so the value is created once; the proxy reads the
 * request on each property access instead. Visitors get the published values
 * (a server-rendered site serves edits made after the build); editors also get
 * their drafts, with binding keys.
 */
export declare function bindDataFile<T>(value: T, collection: string): T;
//# sourceMappingURL=content-bindings.d.ts.map