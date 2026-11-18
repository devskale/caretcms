type ModuleGraphLike = {
    getModuleById(id: string): unknown;
    invalidateModule(module: unknown): void;
};
type ServerLike = {
    watcher: {
        on(event: string, listener: (file: string) => void): void;
    };
    environments?: Record<string, {
        moduleGraph?: ModuleGraphLike;
    }>;
};
/**
 * `virtual:caretcms/page-content`: the text and images templates state for
 * their `data-caret` bindings, so the Studio can list and open them before
 * anything is saved. Scanned from `src/` when the module loads; in dev a
 * template change invalidates it, and the next Studio read scans again.
 */
export declare function createPageContentPlugin(srcDir: string): {
    name: string;
    resolveId(id: string): "\0virtual:caretcms/page-content" | null;
    load(id: string): string | null;
    configureServer(server: ServerLike): void;
};
export {};
//# sourceMappingURL=page-content-plugin.d.ts.map