/**
 * Publish-time body splice: apply drafted block edits to a markdown source
 * file. This is the ONLY code that rewrites user prose in place, so it is
 * all-or-nothing by construction — every block's range is re-verified against
 * the CURRENT file (hash + bounds + overlap) before a single byte moves, and
 * any failure leaves the file untouched.
 *
 * Pure (string -> string) so it can be property-tested without a filesystem;
 * `MarkdownAdapter.spliceBodyBlocks` wraps it with read + atomic write.
 */
import { type MdSrc } from "./contracts.js";
export interface BodySplice {
    /** Server-derived markdown to put in the block's place. */
    md: string;
    /** The verified source range the draft was made against. */
    src: MdSrc;
}
export type SpliceResult = {
    ok: true;
    content: string;
} | {
    ok: false;
    reason: "stale" | "overlap";
};
/**
 * Splice `blocks` into `fileSource`. Returns the new file content, or a
 * failure (`stale` = a range no longer hashes, the file changed since the
 * draft; `overlap` = two drafts claim intersecting ranges, which can only
 * happen through a corrupted draft store — never write through it).
 */
export declare function spliceBodyBlocks(fileSource: string, blocks: readonly BodySplice[]): SpliceResult;
//# sourceMappingURL=splice.d.ts.map