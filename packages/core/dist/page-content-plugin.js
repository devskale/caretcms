import { scanPageContent } from "./page-content-scan.js";
const MODULE_ID = "virtual:caretcms/page-content";
const RESOLVED_ID = `\0${MODULE_ID}`;
/**
 * `virtual:caretcms/page-content`: the text and images templates state for
 * their `data-caret` bindings, so the Studio can list and open them before
 * anything is saved. Scanned from `src/` when the module loads; in dev a
 * template change invalidates it, and the next Studio read scans again.
 */
export function createPageContentPlugin(srcDir) {
    return {
        name: "caretcms:page-content",
        resolveId(id) {
            return id === MODULE_ID ? RESOLVED_ID : null;
        },
        load(id) {
            if (id !== RESOLVED_ID)
                return null;
            return `export default ${JSON.stringify(scanPageContent(srcDir))};`;
        },
        configureServer(server) {
            const invalidate = (file) => {
                if (!file.endsWith(".astro") || !file.startsWith(srcDir))
                    return;
                for (const environment of Object.values(server.environments ?? {})) {
                    const graph = environment.moduleGraph;
                    const module = graph?.getModuleById(RESOLVED_ID);
                    if (graph && module)
                        graph.invalidateModule(module);
                }
            };
            for (const event of ["add", "change", "unlink"])
                server.watcher.on(event, invalidate);
        },
    };
}
//# sourceMappingURL=page-content-plugin.js.map