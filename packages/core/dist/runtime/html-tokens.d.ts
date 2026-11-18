/** Conservative HTML element scanner. Never treats raw text or attribute values as tags. */
export type HtmlAttribute = {
    value: string;
    start: number;
    end: number;
};
export type HtmlTag = {
    name: string;
    start: number;
    end: number;
    closing: boolean;
    void: boolean;
    attributes: Map<string, HtmlAttribute>;
};
export declare function scanHtmlTags(html: string): Generator<HtmlTag>;
/** Includes Markdown stamps, while excluding attribute-like prose and raw text. */
export declare function hasCaretBindings(html: string): boolean;
//# sourceMappingURL=html-tokens.d.ts.map