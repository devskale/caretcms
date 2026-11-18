/** collection → id → field → the text (or image src) the template itself renders. */
export type PageContent = Record<string, Record<string, Record<string, string>>>;
/** Every literal `data-caret` binding and `editable()` default in one template. */
export declare function scanTemplate(source: string, into?: PageContent): PageContent;
/** Scan every `.astro` file under `srcDir`. */
export declare function scanPageContent(srcDir: string): PageContent;
//# sourceMappingURL=page-content-scan.d.ts.map