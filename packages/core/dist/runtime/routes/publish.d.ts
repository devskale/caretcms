export declare const prerender = false;
import type { APIContext } from "astro";
/**
 * POST /api/cms/publish — flush the current editor's draft overlay into the base.
 * Body: `{ collection?, id? }` to scope to one entry/collection, or `{}` for all.
 * Returns the published entries with their NEW base revisions so the editor
 * client can reconcile its revision cache (avoiding a post-publish 409).
 */
export declare function POST(context: APIContext): Promise<Response>;
//# sourceMappingURL=publish.d.ts.map