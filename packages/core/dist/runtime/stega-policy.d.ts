/**
 * Which content strings may carry a hidden binding key.
 *
 * Content bound automatically (Astro `getCollection()` results, imported data
 * files) flows through theme code that compares, looks up, and routes on some
 * of its strings: `category === "espresso"`, `<Icon name={item.icon}>`,
 * `href === Astro.url.pathname`. A key appended to such a value breaks that
 * code, so only display text is encoded. The schema decides first (enums,
 * consts, and formats are machine values); without one, field names and the
 * value's shape decide.
 */
import type { JsonSchemaNode } from "../schema-utils.js";
/**
 * FNV-1a over the whitespace-collapsed text. The browser binds an element only
 * when its visible text hashes the same, so a value the theme split into
 * words, truncated, or rewrote in code is never bound: saving it would replace
 * the whole stored value with a fragment. Mirrored in editor/stega-hydrate.js.
 */
export declare function contentHash(text: string): string;
/** A value with its binding key and content hash hidden at the end. */
export declare function encodeBound(value: string, key: string): string;
/** The binding key of a decoded payload: a bare key (`editable()`, live
 *  loaders) or `{ k, h }`, accepted only when `text` still hashes to `h`. */
export declare function payloadKey(payload: unknown, text: string): string | undefined;
/** True when `value` at `fieldName` is display text that may carry a key. */
export declare function isEncodableText(value: string, fieldName: string, schema?: JsonSchemaNode): boolean;
/**
 * An Astro `reference()` value, `{ collection, id }` (or `slug`): a lookup key
 * the theme passes to `getEntry()`. A marker on either string finds nothing.
 */
export declare function isEntryReference(value: unknown): boolean;
/**
 * Encode every display string in `value` with `prefix::<dot.path>`. Objects
 * that are not plain records (Dates, image metadata, class instances) pass
 * through untouched, as do keys starting with `__` (private storage keys).
 */
export declare function encodeContent(value: unknown, prefix: string, path: string, schema?: JsonSchemaNode, fieldName?: string): unknown;
/**
 * Overlay stored values on parsed ones where the types agree. Astro has
 * already parsed `base` (defaults applied, dates as Date objects); `stored` is
 * the raw saved form, so a stored string never replaces a Date, and keys the
 * schema defaulted survive.
 */
export declare function mergeStored(base: unknown, stored: unknown): unknown;
//# sourceMappingURL=stega-policy.d.ts.map