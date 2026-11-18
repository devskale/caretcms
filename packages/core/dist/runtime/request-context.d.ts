import type { AuthorizationAction, EditorIdentity, StorageAdapter, UploadHandler } from "../types.js";
export interface CaretRequestContext {
    adapter: StorageAdapter;
    /**
     * The published store under `adapter` when a draft overlay is installed, so
     * editor reads can compare a draft with what visitors see.
     */
    publishedAdapter?: StorageAdapter;
    /** A request-bound, fail-closed policy. Omitted in legacy full-access mode. */
    authorize?: (action: AuthorizationAction, collection?: string, id?: string) => Promise<boolean>;
    uploadHandler: UploadHandler;
    sessionId: string | null;
    demoMode: boolean;
    /**
     * True when this request is from an authenticated editor (or an active demo
     * overlay). Gates draft-only behavior such as stega encoding in the live
     * loaders. Set by the middleware after auth is resolved; absent means false.
     */
    editor?: boolean;
    /**
     * The authenticated editor's id (from the session cookie), when present. Keys
     * the per-editor draft overlay so unpublished edits stay isolated per editor.
     * Absent for anonymous/public and non-preview requests; demo sessions key
     * their overlay by `sessionId` instead.
     */
    editorId?: string | null;
    /** Named identity supplied by an optional authoritative identity adapter. */
    identity?: EditorIdentity | null;
    /** True when an external identity adapter is configured and authoritative. */
    identityAuthoritative?: boolean;
    /**
     * True only when a per-session storage overlay was actually installed for
     * this demo request, guaranteeing writes are isolated from the shared base
     * store. Demo editor rights are granted only when this holds — see
     * `isEditorAuthenticated`. Absent/false means fail closed.
     */
    overlayActive?: boolean;
    /**
     * The platform runtime env, when the host exposes one (Cloudflare Workers
     * populate bindings via `context.locals.runtime.env`). Lets the auth helpers
     * read `CARET_EDIT_PASSWORD` / `CARET_SESSION_SECRET` from Worker bindings, not
     * just `process.env`. Null/absent on Node hosts, where `process.env` is used.
     */
    runtimeEnv?: Record<string, unknown> | null;
    /**
     * Editor requests only: the stored (draft-aware) entries of every data-file
     * collection, by collection then id. Imported data files read it
     * synchronously during render; see `content-bindings.ts`.
     */
    dataFiles?: Map<string, Map<string, Record<string, unknown>>>;
}
export declare function runWithRequestContext<T>(context: CaretRequestContext, fn: () => Promise<T>): Promise<T>;
export declare function getRequestContext(): CaretRequestContext | undefined;
export declare function requireRequestContext(): CaretRequestContext;
//# sourceMappingURL=request-context.d.ts.map