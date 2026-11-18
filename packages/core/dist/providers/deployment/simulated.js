class SimulatedDeploymentStatusProvider {
    options;
    constructor(options = {}) {
        this.options = options;
    }
    async getDeploymentStatus({ target }) {
        const configured = this.options.durationMs;
        const durationMs = Number.isFinite(configured)
            ? Math.max(0, Math.min(Number(configured), 60_000))
            : 1_500;
        const buildId = `simulated-${target.id}`;
        if (Date.now() - target.requestedAt < durationMs) {
            return { state: "deploying", buildId };
        }
        if (this.options.result === "failed") {
            return { state: "failed", buildId, message: "Simulated deployment failed" };
        }
        return {
            state: "live",
            buildId,
            deployed: { published: target.published, commit: target.commit },
        };
    }
}
export function simulatedDeploymentProvider(options) {
    return new SimulatedDeploymentStatusProvider(options);
}
export default simulatedDeploymentProvider;
//# sourceMappingURL=simulated.js.map