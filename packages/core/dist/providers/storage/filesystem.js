import { FilesystemAdapter } from "../../runtime/storage/filesystem-adapter.js";
export function filesystemStorageProvider(options) {
    return new FilesystemAdapter(options);
}
export default filesystemStorageProvider;
//# sourceMappingURL=filesystem.js.map