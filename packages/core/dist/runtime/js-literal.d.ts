/**
 * A strict reader for JavaScript literal values in template frontmatter: the
 * strings, numbers, booleans, null, arrays and objects that `editable()` calls
 * pass (caretize writes them as plain literals). Anything else (an identifier,
 * a call, a template literal with `${…}`, a spread) makes the whole value
 * unreadable, so a computed default is never mistaken for a stated one.
 * No evaluation: source text in, plain data out.
 */
export type Literal = string | number | boolean | null | Literal[] | {
    [key: string]: Literal;
};
/** The literal starting at `start` and where it ends, or null when it isn't one. */
export declare function readLiteral(src: string, start: number): {
    value: Literal;
    end: number;
} | null;
//# sourceMappingURL=js-literal.d.ts.map