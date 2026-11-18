import type { UploadHandler } from "../../types.js";
export declare class FilesystemUploadHandler implements UploadHandler {
    private readonly uploadsDir;
    constructor(options?: {
        uploadsDir?: string;
    });
    upload(file: File): Promise<{
        url: string;
    }>;
}
//# sourceMappingURL=filesystem-upload-handler.d.ts.map