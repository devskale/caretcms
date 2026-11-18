/**
 * Minimal-diff JSON rewriting. Content files are often hand-formatted (short
 * objects on one line, aligned arrays), so re-serializing the whole file turns
 * a one-word edit into a diff of every line. This parses the original text
 * with the position of every value, then replaces only the values that
 * changed: a changed scalar is replaced in place, and only a value whose
 * structure changed (keys or array length) is re-serialized, indented to match
 * where it sits.
 */
/**
 * `source` with its value changed from `before` (what `source` parses to) to
 * `after`, touching only the text of values that differ. Falls back to a full
 * re-serialization when `source` cannot be parsed for positions.
 */
export declare function spliceJson(source: string, before: unknown, after: unknown, indent: string | number): string;
//# sourceMappingURL=json-splice.d.ts.map