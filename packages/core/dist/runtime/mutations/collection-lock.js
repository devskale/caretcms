const states = new Map();
function acquire(collection, exclusive) {
    let state = states.get(collection);
    if (!state) {
        state = { readers: 0, writing: false, queue: [] };
        states.set(collection, state);
    }
    const current = state;
    function drain() {
        if (current.writing)
            return;
        while (current.queue.length) {
            const next = current.queue[0];
            if (next.exclusive && current.readers)
                return;
            current.queue.shift();
            next.grant();
            if (next.exclusive)
                return;
        }
        if (!current.readers)
            states.delete(collection);
    }
    return new Promise(resolve => {
        current.queue.push({ exclusive, grant() {
                if (exclusive)
                    current.writing = true;
                else
                    current.readers++;
                let released = false;
                resolve(() => {
                    if (released)
                        return;
                    released = true;
                    if (exclusive)
                        current.writing = false;
                    else
                        current.readers--;
                    drain();
                });
            } });
        drain();
    });
}
/** Non-reentrant. Acquire shared collections in a stable order before entry locks. */
export async function withCollectionReads(collections, task) {
    const releases = [];
    try {
        for (const collection of [...new Set(collections)].sort())
            releases.push(await acquire(collection, false));
        return await task();
    }
    finally {
        for (const release of releases.reverse())
            release();
    }
}
export async function withCollectionWrite(collection, task) {
    const release = await acquire(collection, true);
    try {
        return await task();
    }
    finally {
        release();
    }
}
//# sourceMappingURL=collection-lock.js.map