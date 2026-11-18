/**
 * Shared deep-value helpers used by the bind/mutation engine, the rewrite
 * engine, editable(), and the browser runtime. One definition of dot-path
 * semantics: object keys and numeric array indices both traverse (the getter
 * existed as three hand-rolled copies, one of which refused arrays — so
 * `items.0.title` resolved server-side but not in the cloud live-sync path).
 */
/**
 * Remove the reserved markdown body-draft map from entry data before it
 * reaches any consumer. `__body` is draft plumbing between the md_block
 * mutation and publish; every read boundary (entries route, loadEntry /
 * loadCollection, caretLoader, schema inference) strips it so it never leaks
 * into rendered pages, loader output, or inferred schemas. Deliberately NOT
 * done inside the adapters — the preview rewrite and the publish flush are
 * legitimate consumers and must see it.
 */
export declare function stripBodyOverlay(data: Record<string, unknown>): Record<string, unknown>;
/** Set a deeply nested value by dot-path. Mutates `obj` in place. */
export declare function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void;
/** Read a deeply nested value by dot-path (object keys + numeric array
 *  indices). Counterpart to setNestedValue. The prototype-polluting keys it
 *  refuses make reads fail soft (undefined) where writes fail loud. */
export declare function getNestedValue(data: unknown, path: string): unknown;
//# sourceMappingURL=utils.d.ts.map