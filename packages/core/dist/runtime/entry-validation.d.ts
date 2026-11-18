import type { StorageAdapter } from "../types.js";
import { type JsonSchemaValidationIssue } from "../schema-utils.js";
export declare class EntryValidationError extends Error {
    readonly issues: JsonSchemaValidationIssue[];
    constructor(issues: JsonSchemaValidationIssue[]);
}
/** Validate final public content before a new transition starts. Deletion has no fields. */
export declare function validateEntryTransition(adapter: StorageAdapter, collection: string, data: Record<string, unknown> | null): Promise<JsonSchemaValidationIssue[]>;
//# sourceMappingURL=entry-validation.d.ts.map