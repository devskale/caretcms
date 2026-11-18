/**
 * Sätteri mdast plugin that stamps `data-caret-md` bindings (Astro 7).
 *
 * Registered on `markdown.processor.options.mdastPlugins` by the integration
 * when markdown storage is active. Position tracking is opt-in, so the plugin
 * declares `options: { position: true }`. Attributes are written through the
 * per-node `data.hProperties` bag, which Sätteri carries into the rendered
 * HTML like remark-rehype.
 *
 * Type-only imports keep core free of a `satteri` runtime dependency — the
 * package is present in the user's Astro build, never shipped by us.
 */
import type { MdastPluginDefinition } from "satteri";
interface CaretSatteriOptions {
    contentRoot: string;
}
export declare function caretSatteriPlugin(options: CaretSatteriOptions): MdastPluginDefinition;
export {};
//# sourceMappingURL=satteri.d.ts.map