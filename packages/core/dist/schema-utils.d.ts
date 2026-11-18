/**
 * Shared schema utility functions used by both the schema route and the
 * virtual schemas module to build default templates from JSON Schema.
 */
export type JsonSchemaNode = {
    type?: string;
    properties?: Record<string, JsonSchemaNode>;
    items?: JsonSchemaNode;
    enum?: unknown[];
    required?: string[];
    default?: unknown;
    [key: string]: unknown;
};
export type JsonSchemaValidationIssue = {
    path: string;
    code: string;
    message: string;
};
/** Dependency-free validator for the JSON Schema subset Caret's Studio renders. */
export declare function validateJsonSchema(value: unknown, schema: JsonSchemaNode): JsonSchemaValidationIssue[];
export declare function inferJsonSchema(value: unknown): JsonSchemaNode;
export declare function buildTemplate(schema: unknown): Record<string, unknown> | null;
/**
 * Required text fields a change empties. JSON Schema's `required` only asks
 * for the key, but editors read a required field as one that must have text,
 * so a save may not blank one that had a value. Values that were already
 * empty are left alone, so existing content stays savable. Array items are
 * not compared: a reorder would pair unrelated items by index.
 */
export declare function clearedRequiredText(schema: JsonSchemaNode, before: unknown, after: unknown): JsonSchemaValidationIssue[];
/**
 * Required text fields left empty. Creating an entry asks for them, so a new
 * entry never appears with blank or placeholder content.
 */
export declare function emptyRequiredText(schema: JsonSchemaNode, data: unknown): JsonSchemaValidationIssue[];
//# sourceMappingURL=schema-utils.d.ts.map