/**
 * Server-side HTML sanitizer for rich text fields.
 *
 * Token-based (no DOM dependency) — works in Node, Deno, edge runtimes.
 * Allowlist + class matcher live in ./rich-allowlist.ts, shared with the cloud
 * sanitizer; static/cms/editor/sanitize.js mirrors them by hand.
 */
import { type AllowedClasses } from "./rich-allowlist.js";
export type { AllowedClasses } from "./rich-allowlist.js";
export interface SanitizeOptions {
    allowedClasses?: AllowedClasses;
}
export declare function sanitizeHtml(html: string, options?: SanitizeOptions): string;
//# sourceMappingURL=sanitize-html.d.ts.map