import "virtual:caretcms/schemas";
type MiddlewareContext = {
    locals: Record<string, unknown>;
    cookies?: {
        get: (name: string) => {
            value: string;
        } | undefined;
    };
    request?: Request;
    isPrerendered?: boolean;
};
type MiddlewareNext = () => Promise<Response>;
export declare function onRequest(context: MiddlewareContext, next: MiddlewareNext): Promise<Response>;
export {};
//# sourceMappingURL=middleware.d.ts.map