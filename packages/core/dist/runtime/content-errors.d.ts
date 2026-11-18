export declare class ContentReadError extends Error {
    readonly code: "unsupported_content" | "invalid_content" | "storage_error";
    constructor(code: "unsupported_content" | "invalid_content" | "storage_error");
}
export declare function contentReadFailure(error: unknown): {
    code: string;
    error: string;
};
//# sourceMappingURL=content-errors.d.ts.map