export declare const prerender = false;
import type { APIContext } from "astro";
/**
 * GET /api/cms/draft — report whether the current editor has unpublished drafts.
 */
export declare function GET(context: APIContext): Promise<Response>;
/**
 * DELETE /api/cms/draft — discard the current editor's draft(s) without
 * publishing. Optional `?collection=&id=` query scopes it to one entry or
 * collection; absent, the editor's whole draft is dropped.
 */
export declare function DELETE(context: APIContext): Promise<Response>;
//# sourceMappingURL=draft.d.ts.map