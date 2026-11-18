import { createHash } from "node:crypto";
import { validGitJournalReceipt } from "../git-journal-receipt.js";
import { sameContent } from "../draft-state.js";
import { mkdir, readFile, readdir, rm, unlink } from "node:fs/promises";
import { join } from "node:path";
import { atomicWrite, serializeWrite } from "./atomic-write.js";
import { COLLECTION_NAME_RE } from "./id-contracts.js";
const HISTORY_LIMIT = 50;
function isValidRevision(value) {
    return typeof value === "number" && Number.isInteger(value) && value >= 0;
}
function isHistoryEntry(value) {
    if (!value || typeof value !== "object" || Array.isArray(value))
        return false;
    const obj = value;
    return (typeof obj.ts === "number" &&
        Number.isFinite(obj.ts) &&
        typeof obj.action === "string" &&
        "data" in obj);
}
/** Directory names under `dir` that are valid collection names. */
export async function listCollectionDirs(dir) {
    try {
        const entries = await readdir(dir, { withFileTypes: true });
        return entries
            .filter((e) => e.isDirectory() && COLLECTION_NAME_RE.test(e.name))
            .map((e) => e.name);
    }
    catch {
        return [];
    }
}
/**
 * Owns all `.caretcms/` sidecar I/O — the single shared revisions map, per-entry
 * history files, and collection-metadata JSON. It knows nothing about how the
 * entries themselves are stored, so any filesystem-backed StorageAdapter (JSON
 * blobs, markdown files, …) can compose it for its revision/history/collection-
 * metadata concerns rather than reimplementing this safety-critical logic.
 *
 * Crash-safe via `atomicWrite`; the revisions store is additionally serialized
 * per-path via `serializeWrite` so concurrent `bumpRevision` calls never tear
 * the read-increment-write sequence.
 */
export class SidecarMetaStore {
    metaRoot;
    constructor(options) {
        this.metaRoot = options.metaRoot;
    }
    async getRebuildReceipt() {
        try {
            return JSON.parse(await readFile(join(this.metaRoot, "rebuild.json"), "utf8"));
        }
        catch (error) {
            if (error.code === "ENOENT")
                return null;
            throw error;
        }
    }
    async setRebuildReceipt(receipt) {
        const path = join(this.metaRoot, "rebuild.json");
        if (receipt === null) {
            await rm(path, { force: true });
            return;
        }
        await mkdir(this.metaRoot, { recursive: true });
        await atomicWrite(path, JSON.stringify(receipt));
    }
    async getDeploymentTarget() {
        try {
            return JSON.parse(await readFile(join(this.metaRoot, "deployment.json"), "utf8"));
        }
        catch (error) {
            if (error.code === "ENOENT")
                return null;
            throw error;
        }
    }
    async setDeploymentTarget(target) {
        const path = join(this.metaRoot, "deployment.json");
        if (target === null) {
            await rm(path, { force: true });
            return;
        }
        await mkdir(this.metaRoot, { recursive: true });
        await atomicWrite(path, JSON.stringify(target));
    }
    journalPath(operationId) {
        return join(this.metaRoot, "git-journal", `${createHash("sha256").update(operationId).digest("hex")}.json`);
    }
    async listGitJournalReceipts() {
        const dir = join(this.metaRoot, "git-journal");
        let files;
        try {
            files = await readdir(dir, { withFileTypes: true });
        }
        catch (error) {
            if (error.code === "ENOENT")
                return [];
            throw error;
        }
        const receipts = [];
        for (const file of files.sort((a, b) => a.name.localeCompare(b.name))) {
            if (file.isFile() && /^[a-f0-9]{64}\.json\.[a-f0-9-]{36}\.tmp$/.test(file.name))
                continue;
            if (!file.isFile() || !/^[a-f0-9]{64}\.json$/.test(file.name))
                throw new Error("Invalid Git journal queue file");
            let value;
            try {
                value = JSON.parse(await readFile(join(dir, file.name), "utf8"));
            }
            catch (error) {
                if (error.code === "ENOENT")
                    continue;
                throw error;
            }
            if (!validGitJournalReceipt(value) || this.journalPath(value.operationId) !== join(dir, file.name)) {
                throw new Error("Invalid Git journal receipt");
            }
            receipts.push(value);
        }
        return receipts;
    }
    async saveGitJournalReceipt(receipt) {
        if (!validGitJournalReceipt(receipt))
            throw new Error("Invalid Git journal receipt");
        const immutable = JSON.parse(JSON.stringify(receipt));
        const path = this.journalPath(immutable.operationId);
        await serializeWrite(path, async () => {
            try {
                const previous = JSON.parse(await readFile(path, "utf8"));
                if (!validGitJournalReceipt(previous) || !sameContent(previous, immutable))
                    throw new Error("Git journal receipt changed");
                return;
            }
            catch (error) {
                if (error.code !== "ENOENT")
                    throw error;
            }
            await mkdir(join(this.metaRoot, "git-journal"), { recursive: true });
            await atomicWrite(path, JSON.stringify(immutable));
        });
    }
    async deleteGitJournalReceipt(operationId) {
        const path = this.journalPath(operationId);
        await serializeWrite(path, () => rm(path, { force: true }));
    }
    revisionStorePath() {
        return join(this.metaRoot, "revisions.json");
    }
    revisionMapKey(collection, id) {
        return `${collection}::${id}`;
    }
    historyFilePath(collection, id) {
        return join(this.metaRoot, "history", collection, `${id}.json`);
    }
    collectionsMetaDir() {
        return join(this.metaRoot, "collections");
    }
    collectionMetaPath(collection) {
        return join(this.collectionsMetaDir(), `${collection}.json`);
    }
    // --- Revisions ---
    async readRevisionMap() {
        const filePath = this.revisionStorePath();
        let raw;
        try {
            raw = await readFile(filePath, "utf8");
        }
        catch (error) {
            // A missing file is the normal greenfield state: no revisions recorded
            // yet, so every entry is at 0.
            if (error?.code === "ENOENT")
                return {};
            throw error;
        }
        let parsed;
        try {
            parsed = JSON.parse(raw);
        }
        catch (cause) {
            // A corrupt revisions file must NOT silently read as "{}" → every entry
            // at revision 0, which would let stale writers clobber newer data and
            // defeat optimistic concurrency. Surface it so the operator can recover
            // rather than losing edits silently. Atomic writes make this rare.
            throw new Error(`[caretcms] revisions store is corrupt and could not be parsed: ${filePath}. ` +
                `Repair or remove the file to recover.`, { cause });
        }
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
            return {};
        const map = parsed;
        const out = {};
        Object.entries(map).forEach(([key, value]) => {
            if (isValidRevision(value)) {
                out[key] = value;
            }
        });
        return out;
    }
    async writeRevisionMap(map) {
        const filePath = this.revisionStorePath();
        await mkdir(this.metaRoot, { recursive: true });
        await atomicWrite(filePath, `${JSON.stringify(map, null, 2)}\n`);
    }
    async getRevision(collection, id) {
        const map = await this.readRevisionMap();
        const value = map[this.revisionMapKey(collection, id)];
        return isValidRevision(value) ? value : 0;
    }
    async getRevisions(collection, ids) {
        const map = await this.readRevisionMap();
        return ids.map(id => {
            const value = map[this.revisionMapKey(collection, id)];
            return isValidRevision(value) ? value : 0;
        });
    }
    async bumpRevision(collection, id) {
        return serializeWrite(this.revisionStorePath(), async () => {
            const map = await this.readRevisionMap();
            const key = this.revisionMapKey(collection, id);
            const current = isValidRevision(map[key]) ? map[key] : 0;
            const next = current + 1;
            map[key] = next;
            await this.writeRevisionMap(map);
            return next;
        });
    }
    /** Invalidate a deleted collection in one atomic revision-map replacement. */
    async bumpRevisions(collection, ids) {
        if (!ids.length)
            return;
        await serializeWrite(this.revisionStorePath(), async () => {
            const map = await this.readRevisionMap();
            for (const id of new Set(ids)) {
                const key = this.revisionMapKey(collection, id);
                const current = isValidRevision(map[key]) ? map[key] : 0;
                map[key] = current + 1;
            }
            await this.writeRevisionMap(map);
        });
    }
    // --- History ---
    async readHistoryFile(collection, id) {
        const filePath = this.historyFilePath(collection, id);
        try {
            const raw = await readFile(filePath, "utf8");
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || !parsed.every(isHistoryEntry)) {
                throw new Error("Invalid history store");
            }
            return parsed;
        }
        catch (error) {
            // Recovery deduplicates by operationId. Treating a failed read as empty
            // could append a second copy or overwrite existing history.
            if (error.code === "ENOENT")
                return [];
            throw error;
        }
    }
    async writeHistoryFile(collection, id, entries) {
        const filePath = this.historyFilePath(collection, id);
        await mkdir(join(this.metaRoot, "history", collection), { recursive: true });
        await atomicWrite(filePath, `${JSON.stringify(entries, null, 2)}\n`);
    }
    async getHistory(collection, id) {
        return this.readHistoryFile(collection, id);
    }
    async appendHistory(collection, id, entry) {
        const current = await this.readHistoryFile(collection, id);
        const next = [entry, ...current].slice(0, HISTORY_LIMIT);
        await this.writeHistoryFile(collection, id, next);
    }
    /** Collection names that have sidecar history recorded. */
    async listHistoryCollections() {
        return listCollectionDirs(join(this.metaRoot, "history"));
    }
    // --- Collection metadata ---
    /**
     * Persist a collection's metadata JSON. Sidecar-only: this never creates an
     * entry-storage directory — that is the concrete adapter's concern (and for
     * source-backed adapters, the directory is owned by the project, not the CMS).
     */
    async createCollection(metadata) {
        const dir = this.collectionsMetaDir();
        await mkdir(dir, { recursive: true });
        await atomicWrite(this.collectionMetaPath(metadata.id), `${JSON.stringify(metadata, null, 2)}\n`);
    }
    /**
     * Remove a collection's sidecar state (metadata JSON + history). It does NOT
     * touch entry storage — the concrete adapter decides whether deleting a
     * collection should remove its entries (the JSON adapter does; a source-file
     * adapter must not destroy version-controlled content).
     */
    async deleteCollection(collection) {
        // unlink has no `force` option, so guard the metadata file against ENOENT.
        const metaPath = this.collectionMetaPath(collection);
        try {
            await unlink(metaPath);
        }
        catch (error) {
            const maybeErr = error;
            if (maybeErr?.code !== "ENOENT")
                throw error;
        }
        // rm({ force: true }) is a no-op on missing paths and still throws real errors.
        await rm(join(this.metaRoot, "history", collection), { recursive: true, force: true });
    }
    async getCollectionMetadata(collection) {
        const filePath = this.collectionMetaPath(collection);
        try {
            const raw = await readFile(filePath, "utf8");
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
                return null;
            return parsed;
        }
        catch {
            return null;
        }
    }
    async listCollectionMetadata() {
        const dir = this.collectionsMetaDir();
        try {
            const files = await readdir(dir, { withFileTypes: true });
            const metadataFiles = files
                .filter((item) => item.isFile() && item.name.endsWith(".json"))
                .map((item) => item.name.slice(0, -".json".length));
            const metadata = await Promise.all(metadataFiles.map((name) => this.getCollectionMetadata(name)));
            return metadata.filter((m) => Boolean(m));
        }
        catch {
            return [];
        }
    }
}
//# sourceMappingURL=sidecar-meta-store.js.map