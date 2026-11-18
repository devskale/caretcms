import type { DeploymentStatusEvidence, DeploymentStatusProvider, DeploymentTarget } from "../../types.js";
export interface GitHubDeploymentOptions extends Record<string, unknown> {
    /** Repository owner or organization. */
    owner: string;
    /** Repository name without `.git`. */
    repo: string;
    /** Optional GitHub deployment environment to restrict matches. */
    environment?: string;
    /** Server-side environment variable containing a GitHub token. Defaults to `GITHUB_TOKEN`. */
    tokenEnv?: string;
}
export declare class GitHubDeploymentStatusProvider implements DeploymentStatusProvider {
    private readonly owner;
    private readonly repo;
    private readonly environment;
    private readonly tokenEnv;
    constructor(options: GitHubDeploymentOptions);
    private headers;
    private json;
    getDeploymentStatus({ target }: {
        target: DeploymentTarget;
        request: Request;
    }): Promise<DeploymentStatusEvidence>;
}
export declare function githubDeploymentProvider(options: GitHubDeploymentOptions): DeploymentStatusProvider;
export default githubDeploymentProvider;
//# sourceMappingURL=github.d.ts.map