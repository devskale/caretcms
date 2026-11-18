import type { CaretRuntimeConfig } from "../config.js";
import type { StorageAdapter } from "../../types.js";
import { type StudioNavItem } from "./studio-layout.js";
/**
 * Every Studio collection for the sidebar and the command palette, with the
 * palette's "New …" action for collections the editor may add entries to.
 */
export declare function studioNavigation(runtime: CaretRuntimeConfig, adapter: StorageAdapter, selected?: string): Promise<StudioNavItem[]>;
//# sourceMappingURL=studio-navigation.d.ts.map