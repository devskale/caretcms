import type { IncomingMessage } from "node:http";
type DevRequest = Pick<IncomingMessage, "headers">;
/** Installed only on the static authoring dev server, before Astro strips
 * headers from prerendered routes. Keeping the route prerendered preserves
 * getStaticPaths props and the production static build. */
export declare function withDevRequest<T>(request: DevRequest, next: () => T): T;
/** Restore request identity for Caret only; do not change Astro's page context
 * or accept a browser-supplied header as proof of authentication. */
export declare function getDevAuthContext(request: Request | undefined, isPrerendered?: boolean): {
    request: Request;
    cookies: {
        get(name: string): {
            value: string;
        } | undefined;
    };
} | undefined;
export {};
//# sourceMappingURL=dev-request-context.d.ts.map