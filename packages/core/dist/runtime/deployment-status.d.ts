import type { DeploymentStatusEvidence, DeploymentTarget, RebuildReceipt } from "../types.js";
/** True when provider evidence proves the target revision was in the build. */
export declare function deploymentCoversTarget(target: DeploymentTarget, deployed: RebuildReceipt | undefined): boolean;
export type PublicDeploymentStatus = {
    configured: true;
    state: "deploying" | "live" | "failed" | "unknown";
    buildId: string | null;
    buildUrl?: string;
    message?: string;
    target: DeploymentTarget;
    checkedAt: number;
};
export declare function normalizeDeploymentEvidence(target: DeploymentTarget, evidence: DeploymentStatusEvidence, checkedAt?: number): PublicDeploymentStatus;
//# sourceMappingURL=deployment-status.d.ts.map