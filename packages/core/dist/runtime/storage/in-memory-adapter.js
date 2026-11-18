const HISTORY_LIMIT = 50;
export class InMemoryAdapter {
    guarantees = Object.freeze({ persistence: "process", snapshots: "process",
        commits: "process", collectionDeletion: "content" });
    rebuildReceipt = null;
    deploymentTarget = null;
    async getRebuildReceipt() { return structuredClone(this.rebuildReceipt); }
    async setRebuildReceipt(receipt) { this.rebuildReceipt = structuredClone(receipt); }
    async getDeploymentTarget() { return structuredClone(this.deploymentTarget); }
    async setDeploymentTarget(target) { this.deploymentTarget = structuredClone(target); }
    collections = new Map();
    revisions = new Map();
    history = new Map();
    collectionMeta = new Map();
    editorOverlays = new Map();
    /** A persistent per-editor overlay store. Same id → same store, so a draft
     *  survives across requests within this process. */
    async makeEditorOverlay(editorId) {
        let overlay = this.editorOverlays.get(editorId);
        if (!overlay) {
            overlay = new InMemoryAdapter();
            this.editorOverlays.set(editorId, overlay);
        }
        return overlay;
    }
    revisionKey(collection, id) {
        return `${collection}::${id}`;
    }
    /** Preload entries for testing or demo bootstrap. */
    preload(collection, entries) {
        let col = this.collections.get(collection);
        if (!col) {
            col = new Map();
            this.collections.set(collection, col);
        }
        for (const entry of entries) {
            col.set(entry.id, structuredClone(entry.data));
        }
    }
    async discoverCollections() {
        return [...this.collections.keys()].sort((a, b) => a.localeCompare(b));
    }
    async isKnownCollection(collection) {
        return this.collections.has(collection);
    }
    async getEntry(collection, id) {
        const data = this.collections.get(collection)?.get(id);
        if (!data)
            return null;
        return { id, data: structuredClone(data) };
    }
    async listEntryIds(collection) {
        const col = this.collections.get(collection);
        if (!col)
            return [];
        return [...col.keys()].sort((a, b) => a.localeCompare(b));
    }
    async listEntries(collection) {
        const col = this.collections.get(collection);
        if (!col)
            return [];
        return [...col.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([id, data]) => ({ id, data: structuredClone(data) }));
    }
    async writeEntry(collection, id, data) {
        let col = this.collections.get(collection);
        if (!col) {
            col = new Map();
            this.collections.set(collection, col);
        }
        col.set(id, structuredClone(data));
    }
    async deleteEntry(collection, id) {
        this.collections.get(collection)?.delete(id);
    }
    async getRevision(collection, id) {
        return this.revisions.get(this.revisionKey(collection, id)) ?? 0;
    }
    async bumpRevision(collection, id) {
        const key = this.revisionKey(collection, id);
        const current = this.revisions.get(key) ?? 0;
        const next = current + 1;
        this.revisions.set(key, next);
        return next;
    }
    async getHistory(collection, id) {
        const entries = this.history.get(this.revisionKey(collection, id));
        return entries ? structuredClone(entries) : [];
    }
    async appendHistory(collection, id, entry) {
        const key = this.revisionKey(collection, id);
        const current = this.history.get(key) ?? [];
        const next = [structuredClone(entry), ...current].slice(0, HISTORY_LIMIT);
        this.history.set(key, next);
    }
    // --- Collection Management ---
    async createCollection(metadata) {
        this.collectionMeta.set(metadata.id, structuredClone(metadata));
        if (!this.collections.has(metadata.id)) {
            this.collections.set(metadata.id, new Map());
        }
    }
    async deleteCollection(collection) {
        // Collection deletion is a content mutation. Keep version tombstones so
        // recreating the same ID cannot make a stale client's revision valid again.
        const ids = new Set(this.collections.get(collection)?.keys());
        for (const key of this.revisions.keys()) {
            if (key.startsWith(`${collection}::`))
                ids.add(key.slice(collection.length + 2));
        }
        for (const id of ids) {
            const key = this.revisionKey(collection, id);
            this.revisions.set(key, (this.revisions.get(key) ?? 0) + 1);
        }
        this.collectionMeta.delete(collection);
        this.collections.delete(collection);
        for (const key of this.history.keys()) {
            if (key.startsWith(`${collection}::`))
                this.history.delete(key);
        }
    }
    async getCollectionMetadata(collection) {
        const meta = this.collectionMeta.get(collection);
        return meta ? structuredClone(meta) : null;
    }
    async listCollectionMetadata() {
        return [...this.collectionMeta.values()]
            .map((m) => structuredClone(m))
            .sort((a, b) => a.id.localeCompare(b.id));
    }
}
//# sourceMappingURL=in-memory-adapter.js.map