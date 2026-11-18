/**
 * Identifier grammar for collections and entry ids, shared across the storage
 * layer so the adapters enforce exactly one definition. These MIRROR the
 * mutation engine's command validation (`runtime/mutations/contracts.ts`): the
 * engine validates ids before they reach an adapter, and the adapters re-check
 * as defense in depth (the markdown adapter especially, since it writes into the
 * project's source tree). Keep all copies byte-identical.
 */
/** A collection name. */
export declare const COLLECTION_NAME_RE: RegExp;
/** An entry id. */
export declare const ENTRY_ID_RE: RegExp;
/**
 * A draft / overlay id (an editor's session UUID). Used as a filesystem path
 * segment for disk-backed draft overlays, so it must not contain path
 * separators or dots — guard against traversal even though ids are minted, not
 * user-supplied.
 */
export declare const EDITOR_ID_RE: RegExp;
/** Throw on an editor/overlay id that isn't a safe path segment; else return it. */
export declare function assertSafeEditorId(editorId: string): string;
//# sourceMappingURL=id-contracts.d.ts.map