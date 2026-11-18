import { FilesystemUploadHandler } from "../../runtime/storage/filesystem-upload-handler.js";
export function localUploadsProvider(options) {
    return new FilesystemUploadHandler(options);
}
export default localUploadsProvider;
//# sourceMappingURL=local.js.map