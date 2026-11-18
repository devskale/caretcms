/**
 * editable() — make an inline value editable in place.
 *
 * The stega twin of `bindEntry` / `data-caret`: instead of putting the binding
 * key on an element (which props/loops break), it hides the key INSIDE the value
 * via stega, so the content stays click-to-edit even when passed through
 * component props, slots, and `.map()` loops — with no attribute and no live
 * collection.
 *
 * Usage in a `.astro` frontmatter:
 *
 *   const features = await editable('pages::home::features.items', [
 *     { title: 'Fast', description: '…' },
 *     { title: 'SEO',  description: '…' },
 *   ]);
 *   <Features items={features} />
 *
 * `key` is `collection::id` or `collection::id::field-prefix`. The value you pass
 * is the DEFAULT — your code stays the source of truth; any saved edits in the
 * store overlay it. In editor mode each string leaf is stega-encoded with its
 * binding key (`collection::id::<dot.path>`), matching the mutation engine's
 * nested-path writes, so edits round-trip to the same store as data-caret.
 *
 * Outside a request (a static build, a prerendered page) the published values
 * still overlay the default, read from the configured storage, so edits reach
 * built HTML; nothing is encoded there. A plain import with no CaretCMS runtime
 * (astro.config, a script) returns the value untouched.
 */
export declare function editable<T>(key: string, value: T): Promise<T>;
//# sourceMappingURL=editable.d.ts.map