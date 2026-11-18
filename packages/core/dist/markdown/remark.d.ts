/**
 * Remark plugin that stamps `data-caret-md` bindings (Astro 6 / unified
 * holdouts). Behaviour-identical to the Sätteri frontend — both call the shared
 * `computeStamp`/`planParagraph`, and a parity test runs the two over the same
 * trees. A tiny internal walker avoids a `unist-util-visit` dependency.
 */
interface CaretRemarkOptions {
    contentRoot: string;
}
interface Pos {
    start?: {
        offset?: number;
    };
    end?: {
        offset?: number;
    };
}
interface MdNode {
    type: string;
    position?: Pos;
    children?: MdNode[];
    data?: Record<string, unknown> & {
        hProperties?: Record<string, unknown>;
    };
}
interface VFileLike {
    value?: unknown;
    path?: string;
    toString(): string;
}
/** Remark transformer (returned by the attacher). Exposed for direct testing. */
export declare function transformCaretRemark(tree: MdNode, file: VFileLike, contentRoot: string): void;
export declare function caretRemarkPlugin(options: CaretRemarkOptions): () => (tree: MdNode, file: VFileLike) => void;
export {};
//# sourceMappingURL=remark.d.ts.map