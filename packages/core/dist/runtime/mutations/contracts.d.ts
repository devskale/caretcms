import type { StorageAdapter } from "../../types.js";
import { type MdSrc } from "../../markdown/contracts.js";
/**
 * Upper bound on an `md_block` HTML payload (UTF-16 code units). A block is a
 * single paragraph/heading/list item; even generous prose stays far below this.
 * A dedicated cap (vs the blanket 1MB JSON body cap) keeps one block edit from
 * dragging megabytes into the draft overlay and every subsequent publish.
 */
export declare const MAX_MD_BLOCK_HTML_LENGTH: number;
export type MutationIssue = {
    path: string;
    code: string;
    message: string;
};
export type SaveFieldCommand = {
    type: "save_field";
    collection: string;
    id: string;
    field: string;
    value: string;
    expectedRevision?: number;
    expectedBaseRevision?: number;
};
export type PutEntryCommand = {
    type: "put_entry";
    collection: string;
    id: string;
    data: Record<string, unknown>;
    expectedRevision?: number;
    expectedBaseRevision?: number;
    /** Reject an existing ID under the mutation lock, including revision-zero seeds. */
    createOnly?: boolean;
};
export type DeleteEntryCommand = {
    type: "delete_entry";
    collection: string;
    id: string;
    expectedRevision?: number;
    expectedBaseRevision?: number;
};
export type ReorderEntriesCommand = {
    type: "reorder_entries";
    collection: string;
    items: Array<{
        id: string;
        order: number;
        expectedRevision?: number;
        expectedBaseRevision?: number;
    }>;
};
export type UpdatePageLayoutCommand = {
    type: "update_page_layout";
    collection: string;
    id: string;
    sections: Array<{
        id: string;
        key: string;
        enabled: boolean;
        spacing_y?: string;
    }>;
    expectedRevision?: number;
    expectedBaseRevision?: number;
};
export type CreateCollectionCommand = {
    type: "create_collection";
    id: string;
    label: string;
    description?: string;
    icon?: string;
    creatable?: boolean;
    orderable?: boolean;
    deletable?: boolean;
    singletonId?: string;
    order?: number;
    schema: {
        type: "object";
        properties: Record<string, unknown>;
        required?: string[];
        title?: string;
        description?: string;
    };
};
export type DeleteCollectionCommand = {
    type: "delete_collection";
    id: string;
};
export type MdBlockCommand = {
    type: "md_block";
    collection: string;
    id: string;
    /** Block identity within the entry body (`data-caret-md` blockPath segment). */
    blockPath: string;
    /** Verified source hint (`data-caret-md-src` value, parsed). */
    src: MdSrc;
    /**
     * The edited block's inline HTML. The ONLY content field — markdown is
     * derived server-side after sanitization, never accepted from the client
     * (client markdown would be spliced into source files verbatim on publish).
     */
    html: string;
    /** Consecutive top-level source paragraphs, edited as one atomic group. */
    sources?: Array<{
        blockPath: string;
        src: MdSrc;
        html: string;
    }>;
    paragraphs?: string[];
    expectedRevision?: number;
    expectedBaseRevision?: number;
};
export type CmsMutationCommand = SaveFieldCommand | PutEntryCommand | DeleteEntryCommand | ReorderEntriesCommand | UpdatePageLayoutCommand | CreateCollectionCommand | DeleteCollectionCommand | MdBlockCommand;
export declare function isRecord(value: unknown): value is Record<string, unknown>;
/**
 * Validate a collection name's *format* (not its existence). A well-formed
 * name is accepted even for a collection that has never been written — writes
 * auto-create collections (FR-8), and reads of a not-yet-created collection
 * are legitimate (the template is the source of truth until the first edit).
 */
export declare function parseCollectionName(value: unknown): string | null;
/**
 * Validate an entry id as a filesystem-safe slug. Blocks `..`, `/`, `\`,
 * leading `.`, and any character outside `[a-z0-9_-]`. Critical: prevents
 * path traversal in adapters that use the id as a filename.
 */
export declare function parseEntryId(value: unknown): string | null;
/** Parse the optional second version without changing the legacy revision grammar. */
export declare function parseMutationCommand(adapter: StorageAdapter, input: unknown): Promise<{
    ok: true;
    command: CmsMutationCommand;
} | {
    ok: false;
    issues: MutationIssue[];
}>;
//# sourceMappingURL=contracts.d.ts.map