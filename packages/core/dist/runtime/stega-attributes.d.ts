/**
 * Attribute stega for editor responses.
 *
 * `editable()` and the live loader hide a binding key inside every string, and
 * the browser editor promotes keys it finds in TEXT. A key inside an ATTRIBUTE
 * (an image src, a link href) would instead reach the browser as part of the
 * URL, so the image or link breaks. Before an editor's HTML is sent, this strips
 * stega from every attribute value and turns a keyed `<img src>` into a normal
 * `data-caret` binding, so data-driven images become replaceable too.
 */
export declare function promoteAttributeStega(html: string): string;
/**
 * Remove stega from places that are not page content: the document head (the
 * tab title, meta tags, structured data) and script and style text anywhere.
 * Nothing there can be clicked, and in the title it shows as stray symbols.
 */
export declare function cleanNonContentStega(html: string): string;
//# sourceMappingURL=stega-attributes.d.ts.map