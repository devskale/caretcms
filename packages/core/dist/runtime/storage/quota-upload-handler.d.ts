import type { UploadHandler, UploadContext } from "../../types.js";
export interface QuotaCounter {
    read(sessionId: string): Promise<number>;
    write(sessionId: string, used: number): Promise<void>;
}
export interface QuotaUploadHandlerOptions {
    inner: UploadHandler;
    counter: QuotaCounter;
    perSessionBytes?: number;
    perFileBytes?: number;
}
/**
 * Decorates an UploadHandler with per-session size limits. Reads the running
 * session usage from the supplied counter, rejects oversized files, and
 * persists the new total after each successful upload.
 */
export declare class QuotaUploadHandler implements UploadHandler {
    private readonly inner;
    private readonly counter;
    private readonly perSessionBytes;
    private readonly perFileBytes;
    private readonly sessionChains;
    constructor(options: QuotaUploadHandlerOptions);
    private withSessionLock;
    upload(file: File, ctx?: UploadContext): Promise<{
        url: string;
    }>;
}
//# sourceMappingURL=quota-upload-handler.d.ts.map