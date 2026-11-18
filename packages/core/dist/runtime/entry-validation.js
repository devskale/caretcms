import { validateJsonSchema } from "../schema-utils.js";
import { getRegisteredSchema, resolveCollectionStudioConfig } from "./schema-registry.js";
import { stripBodyOverlay } from "./utils.js";
import { publicationField } from "./collection-policy.js";
export class EntryValidationError extends Error {
    issues;
    constructor(issues) {
        super("Entry does not match current collection requirements");
        this.issues = issues;
    }
}
/** Validate final public content before a new transition starts. Deletion has no fields. */
export async function validateEntryTransition(adapter, collection, data) {
    if (data === null)
        return [];
    data = stripBodyOverlay(data);
    const schema = getRegisteredSchema(collection)?.schema ??
        (await adapter.getCollectionMetadata(collection))?.schema;
    const issues = schema ? validateJsonSchema(data, schema) : [];
    const field = publicationField(await resolveCollectionStudioConfig(adapter, collection));
    if (field && typeof data[field] !== "boolean") {
        issues.push({ path: field, code: "invalid_type", message: `Managed publication field "${field}" must be a boolean` });
    }
    return issues;
}
//# sourceMappingURL=entry-validation.js.map