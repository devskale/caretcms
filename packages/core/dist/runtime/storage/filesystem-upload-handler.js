import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { IMAGE_KIND_TO_EXT, readAndValidateImage, sanitizeImageBaseName, } from "./image-validation.js";
export class FilesystemUploadHandler {
    uploadsDir;
    constructor(options) {
        this.uploadsDir = options?.uploadsDir ?? join(process.cwd(), "public", "uploads");
    }
    async upload(file) {
        const { kind, bytes } = await readAndValidateImage(file);
        const timestamp = Date.now().toString(36);
        const stem = sanitizeImageBaseName(file.name) || `upload-${timestamp}`;
        const ext = IMAGE_KIND_TO_EXT[kind];
        const filename = `${timestamp}-${stem}.${ext}`;
        await mkdir(this.uploadsDir, { recursive: true });
        await writeFile(join(this.uploadsDir, filename), bytes);
        return { url: `/uploads/${filename}` };
    }
}
//# sourceMappingURL=filesystem-upload-handler.js.map