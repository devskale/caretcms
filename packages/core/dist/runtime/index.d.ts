/**
 * Runtime exports for use in Astro pages.
 *
 *   import { bindEntry, loadEntry, loadCollection } from '@caretcms/core/runtime'
 */
export { bindEntry } from "./bind.js";
export { bindCollectionEntries, bindCollectionEntry, bindDataFile } from "./content-bindings.js";
export { loadEntry, loadCollection, listCollections } from "./content.js";
export type { EntryData } from "./content.js";
export { isPublicEntry, isPublishedEntry } from "./collection-policy.js";
export { SessionOverlayAdapter } from "./storage/session-overlay-adapter.js";
export { QuotaUploadHandler } from "./storage/quota-upload-handler.js";
export type { QuotaCounter, QuotaUploadHandlerOptions, } from "./storage/quota-upload-handler.js";
export { IMAGE_KIND_TO_EXT, IMAGE_MAX_SIZE, IMAGE_MIME_TO_KIND, UPLOAD_MESSAGES, UploadError, detectImageKind, readAndValidateImage, sanitizeImageBaseName, } from "./storage/image-validation.js";
export type { AllowedImageKind } from "./storage/image-validation.js";
//# sourceMappingURL=index.d.ts.map