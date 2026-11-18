import type { CollectionStudioConfig } from "../types.js";
import type { JsonSchemaNode } from "../schema-utils.js";
/**
 * The field that names a collection's entries, read from its schema: a usual
 * title field (title, headline, heading, name, …), else the first required
 * plain text field. Only top-level fields. Undefined without a schema.
 */
export declare function inferTitleField(schema: JsonSchemaNode | null | undefined): string | undefined;
/** "01-mara" → "01 mara", "about_us" → "About us". */
export declare function humanizeEntryId(id: string): string;
/**
 * What editors call an entry, everywhere the Studio names one: a singleton by
 * its collection's label, else its configured title field, else a usual title
 * field, else its id made readable. Never markup.
 */
export declare function entryDisplayTitle(collection: string, id: string, data: Record<string, unknown> | null | undefined, config: Pick<CollectionStudioConfig, "label" | "titleField" | "singletonId">): string;
//# sourceMappingURL=entry-title.d.ts.map