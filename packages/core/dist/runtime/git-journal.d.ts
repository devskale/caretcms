import type { PublicationSourceSnapshot, GitJournalTarget } from "../types.js";
/** True when `cwd` is inside a git work tree. */
export declare function isGitRepo(cwd: string): Promise<boolean>;
export interface CommitOptions {
    /** Repo working directory (a publish runs from the project root). */
    cwd: string;
    /** Files to stage + commit (absolute or repo-relative). Adds, edits, deletes. */
    paths: string[];
    message: string;
    /** Commit author/committer identity (e.g. the editor). Falls back to git config. */
    authorName?: string;
    authorEmail?: string;
}
/**
 * Stage `paths` and commit them. Returns the new commit SHA, or null when there
 * is nothing to commit or anything goes wrong (not a repo, git missing, no diff,
 * git error). Never throws.
 */
export declare function commitPaths(opts: CommitOptions): Promise<string | null>;
/** Journal approved bytes, without staging or reading current working-file content. */
export interface SnapshotCommitOptions extends Omit<CommitOptions, "paths"> {
    sources: PublicationSourceSnapshot[];
    /** Durable idempotency marker, atomically advanced with the target ref. */
    journal?: {
        operationId: string;
        target: GitJournalTarget;
    };
}
/** Capture a repository/checkout identity without serializing runtime credentials. */
export declare function getGitJournalTarget(cwd: string): Promise<GitJournalTarget | null>;
/** A marker acknowledges an earlier journal, even if base content advanced later. */
export declare function readGitJournalCommit(cwd: string, journal: NonNullable<SnapshotCommitOptions["journal"]>): Promise<string | null>;
/** Best effort. A busy index or changed HEAD skips journaling without altering publication. */
export declare function commitSnapshots(opts: SnapshotCommitOptions): Promise<string | null>;
//# sourceMappingURL=git-journal.d.ts.map