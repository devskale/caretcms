import { MarkdownAdapter } from "../../runtime/storage/markdown-adapter.js";
export declare function markdownStorageProvider(options?: {
    contentRoot?: string;
    metaRoot?: string;
    /** Where the content config's `file()` paths resolve from; the integration sets it. */
    projectRoot?: string;
}): MarkdownAdapter;
export default markdownStorageProvider;
//# sourceMappingURL=markdown.d.ts.map