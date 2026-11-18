/**
 * Schema registry for explicit Zod-derived JSON Schemas.
 *
 * When the user passes `schemas` in caret() options, the integration
 * serializes them and injects them into a virtual module. The schema API
 * route reads from this registry and falls back to inference only when
 * no explicit schema is registered for a collection.
 */
import type { JsonSchemaNode } from "../schema-utils.js";
import type { CollectionStudioConfig, StorageAdapter } from "../types.js";
type CollectionSchemaEntry = {
    schema: JsonSchemaNode;
    template: Record<string, unknown> | null;
    metadata?: CollectionStudioConfig;
};
export declare function registerCollectionSchema(collection: string, jsonSchema: JsonSchemaNode, template: Record<string, unknown> | null, metadata?: CollectionStudioConfig): void;
export declare function registerCollectionStudioConfig(collection: string, metadata: CollectionStudioConfig): void;
export declare function getRegisteredSchema(collection: string): CollectionSchemaEntry | null;
export declare function getRegisteredCollectionNames(): string[];
export declare function getStudioCollectionNames(adapter: StorageAdapter): Promise<string[]>;
export declare function getStudioCollections(adapter: StorageAdapter): Promise<Array<{
    name: string;
    config: CollectionStudioConfig;
}>>;
export declare function isKnownStudioCollection(adapter: StorageAdapter, collection: string): Promise<boolean>;
export declare function resolveCollectionStudioConfig(adapter: StorageAdapter, collection: string): Promise<CollectionStudioConfig>;
export {};
//# sourceMappingURL=schema-registry.d.ts.map