/**
 * Settings a production server still needs before anyone can sign in. Empty
 * in dev, where a temporary password and secret stand in.
 */
export declare function missingProductionSettings(): string[];
export declare function isDevEditorPasswordActive(): boolean;
export declare function isEditorPasswordValid(candidate: string): boolean;
/**
 * The session cookie plus a long-lived, signed cookie remembering this
 * browser's editor id, which sign-out keeps. Signing in again in the same
 * browser reuses the id, so drafts, history and Git records survive signing
 * out and session expiry, while people sharing the password on different
 * browsers keep separate drafts.
 */
export declare function issueEditorSessionCookies(path?: string, request?: Request): string[];
export declare function clearEditorSessionCookie(path?: string, request?: Request): string;
export declare function hasConfiguredEditorPassword(): boolean;
type CookieBagLike = {
    cookies?: {
        get: (name: string) => {
            value: string;
        } | undefined;
    };
};
export declare function isEditorAuthenticated(context: CookieBagLike): boolean;
/**
 * The per-editor id carried by the session cookie, used to key a draft overlay.
 * Returns null when the request has no valid editor session. Does NOT consider
 * demo sessions — those are keyed by their own `sessionId`.
 */
export declare function getEditorId(context: CookieBagLike): string | null;
export declare function getEditorIdentity(context: CookieBagLike): import("../../types.js").EditorIdentity | null;
export {};
//# sourceMappingURL=session.d.ts.map