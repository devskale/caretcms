/**
 * Shared image-upload validation primitives. Used by both the filesystem
 * upload handler and adapter implementations (Cloudflare R2, etc.) so every
 * handler treats the browser-supplied `file.type` as a hint and the bytes on
 * disk as authoritative.
 */
export type AllowedImageKind = "jpeg" | "png" | "webp" | "avif";
/**
 * Marks an upload failure whose message is safe to show the end user (a
 * validation/quota rejection, not an internal error). The upload route
 * surfaces `UploadError.message` and returns an opaque message for anything
 * else, so unexpected errors (e.g. a filesystem error carrying a path) never
 * leak to the client.
 */
export declare class UploadError extends Error {
    constructor(message: string);
}
export declare const IMAGE_MIME_TO_KIND: Record<string, AllowedImageKind>;
export declare const IMAGE_KIND_TO_EXT: Record<AllowedImageKind, string>;
export declare const IMAGE_MAX_SIZE: number;
export declare const UPLOAD_MESSAGES: {
    readonly type: "This file type can't be used. Use a JPEG, PNG, WebP or AVIF image.";
    readonly size: "This image is larger than 10 MB. Use a smaller image.";
    readonly contents: "This file isn't a valid JPEG, PNG, WebP or AVIF image.";
    readonly notConfigured: "Uploads aren't set up on this site yet. Ask your developer.";
};
export declare function detectImageKind(bytes: Uint8Array): AllowedImageKind | null;
/**
 * Strip the client-supplied extension entirely; callers re-derive it from the
 * verified magic bytes. Blocks `evil.html` / `evil.svg` filenames from
 * landing in storage even when their byte contents happen to match a
 * permitted image format.
 */
export declare function sanitizeImageBaseName(name: string): string;
/**
 * Common validation pipeline: enforces size cap, declared MIME allowlist,
 * magic-byte match against the declared type, and returns the kind + buffered
 * bytes so the caller can stream them to the destination once.
 */
export declare function readAndValidateImage(file: File): Promise<{
    kind: AllowedImageKind;
    bytes: Uint8Array;
}>;
//# sourceMappingURL=image-validation.d.ts.map