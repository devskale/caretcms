export type DevServerLike = {
    watcher: {
        on(event: string, listener: (file: string) => void): unknown;
    };
    environments?: {
        client?: {
            hot: {
                send: (payload: unknown, ...rest: unknown[]) => unknown;
            };
        };
    };
};
/**
 * Dev only: an editor's save writes content files, and Astro answers file
 * changes with a full page reload, which drops the editor's place and any edit
 * still in progress. Reloads caused only by CaretCMS's own writes are skipped;
 * Astro still refreshes its content store, so the next page load shows the
 * change. A developer's own edits reload as usual. A skipped reload also tells
 * anyone waiting (a publish) that Astro now has the new content.
 */
export declare function createSelfWriteReloadPlugin(): {
    name: string;
    apply: "serve";
    configureServer(server: DevServerLike): void;
};
//# sourceMappingURL=self-write-reload-plugin.d.ts.map