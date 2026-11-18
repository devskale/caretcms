import type { DeploymentStatusProvider } from "../../types.js";
export interface SimulatedDeploymentOptions extends Record<string, unknown> {
    /** Time spent in `deploying`. Defaults to 1500ms. */
    durationMs?: number;
    /** Terminal state. Defaults to `live`. */
    result?: "live" | "failed";
}
export declare function simulatedDeploymentProvider(options?: SimulatedDeploymentOptions): DeploymentStatusProvider;
export default simulatedDeploymentProvider;
//# sourceMappingURL=simulated.d.ts.map