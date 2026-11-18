import type { CollectionStudioConfig } from "../types.js";
export declare function publicationField(config: CollectionStudioConfig | null | undefined): string | null;
export declare function isPublicEntry(data: Record<string, unknown>, config: CollectionStudioConfig | null | undefined): boolean;
/**
 * Test the explicit boolean publication state used by a managed collection.
 * This is useful with Astro's native build-time collection APIs, which do not
 * pass through Caret's request-aware loaders.
 */
export declare function isPublishedEntry(data: Record<string, unknown>, field?: string): boolean;
export declare function resolvePreviewPath(config: CollectionStudioConfig | null | undefined, id: string): string | null;
//# sourceMappingURL=collection-policy.d.ts.map