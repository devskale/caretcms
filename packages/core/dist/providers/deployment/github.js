const GITHUB_API = "https://api.github.com";
const NAME_RE = /^[A-Za-z0-9_.-]+$/;
const ENV_NAME_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
function asRecord(value) {
    if (!value || typeof value !== "object" || Array.isArray(value))
        return null;
    return value;
}
function asText(value) {
    return typeof value === "string" && value.trim() ? value.trim() : null;
}
function asPayload(value) {
    if (typeof value === "string") {
        try {
            return asRecord(JSON.parse(value)) ?? {};
        }
        catch {
            return {};
        }
    }
    return asRecord(value) ?? {};
}
function parseDeployment(value) {
    const row = asRecord(value);
    const id = row?.id;
    const sha = asText(row?.sha);
    const statusesUrl = asText(row?.statuses_url);
    if (!Number.isSafeInteger(id) || Number(id) < 1 || !sha || !statusesUrl)
        return null;
    let parsed;
    try {
        parsed = new URL(statusesUrl);
    }
    catch {
        return null;
    }
    if (parsed.origin !== GITHUB_API)
        return null;
    return {
        id: Number(id),
        sha,
        environment: asText(row?.environment),
        payload: asPayload(row?.payload),
        statusesUrl: parsed.toString(),
    };
}
function parseStatus(value) {
    const row = asRecord(value);
    const state = asText(row?.state);
    if (!state)
        return null;
    return {
        state,
        description: asText(row?.description),
        environmentUrl: asText(row?.environment_url),
        logUrl: asText(row?.log_url),
    };
}
function caretPayload(payload) {
    return asRecord(payload.caret) ?? payload;
}
function deploymentId(payload) {
    return asText(caretPayload(payload).deploymentId);
}
function publishedReceipt(value) {
    if (!Array.isArray(value))
        return [];
    const entries = [];
    for (const item of value) {
        const row = asRecord(item);
        const collection = asText(row?.collection);
        const id = asText(row?.id);
        const revision = row?.revision;
        const deleted = row?.deleted;
        if (!collection || !id || !Number.isSafeInteger(revision) || Number(revision) < 0 || typeof deleted !== "boolean") {
            continue;
        }
        entries.push({ collection, id, revision: Number(revision), deleted });
    }
    return entries;
}
function deployedReceipt(deployment) {
    const payload = caretPayload(deployment.payload);
    return {
        commit: asText(payload.commit) ?? deployment.sha,
        published: publishedReceipt(payload.published),
    };
}
function tokenFromEnvironment(name) {
    if (typeof process === "undefined")
        return null;
    return asText(process.env[name]);
}
function statusEvidence(deployment, status) {
    const buildId = String(deployment.id);
    const buildUrl = status?.environmentUrl ?? status?.logUrl ?? null;
    const message = status?.description ?? undefined;
    if (!status || ["queued", "pending", "in_progress"].includes(status.state)) {
        return {
            state: "deploying",
            buildId,
            ...(buildUrl ? { buildUrl } : {}),
            ...(message ? { message } : {}),
        };
    }
    if (status.state === "success") {
        return {
            state: "live",
            buildId,
            ...(buildUrl ? { buildUrl } : {}),
            ...(message ? { message } : {}),
            deployed: deployedReceipt(deployment),
        };
    }
    return {
        state: "failed",
        buildId,
        ...(buildUrl ? { buildUrl } : {}),
        message: message ?? `GitHub deployment status: ${status.state}`,
    };
}
export class GitHubDeploymentStatusProvider {
    owner;
    repo;
    environment;
    tokenEnv;
    constructor(options) {
        if (!options || !NAME_RE.test(options.owner) || !NAME_RE.test(options.repo)) {
            throw new Error("GitHub deployment owner and repo must use repository-safe names");
        }
        const tokenEnv = options.tokenEnv ?? "GITHUB_TOKEN";
        if (!ENV_NAME_RE.test(tokenEnv))
            throw new Error("GitHub deployment tokenEnv is invalid");
        this.owner = options.owner;
        this.repo = options.repo;
        this.environment = asText(options.environment);
        this.tokenEnv = tokenEnv;
    }
    headers() {
        const headers = new Headers({
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "CaretCMS",
        });
        const token = tokenFromEnvironment(this.tokenEnv);
        if (token)
            headers.set("Authorization", `Bearer ${token}`);
        return headers;
    }
    async json(url) {
        const response = await fetch(url, { headers: this.headers() });
        if (!response.ok)
            throw new Error(`GitHub deployment API returned ${response.status}`);
        return response.json();
    }
    async getDeploymentStatus({ target }) {
        const url = new URL(`/repos/${this.owner}/${this.repo}/deployments`, GITHUB_API);
        url.searchParams.set("per_page", "100");
        if (target.commit)
            url.searchParams.set("sha", target.commit);
        const response = await this.json(url);
        const deployments = Array.isArray(response)
            ? response.map(parseDeployment).filter((item) => item !== null)
            : [];
        const matched = deployments.find((deployment) => deploymentId(deployment.payload) === target.id
            && (!this.environment || deployment.environment === this.environment));
        if (!matched)
            return { state: "deploying", buildId: null };
        const statusesUrl = new URL(matched.statusesUrl);
        statusesUrl.searchParams.set("per_page", "1");
        const statuses = await this.json(statusesUrl);
        const latest = Array.isArray(statuses) ? parseStatus(statuses[0]) : null;
        return statusEvidence(matched, latest);
    }
}
export function githubDeploymentProvider(options) {
    return new GitHubDeploymentStatusProvider(options);
}
export default githubDeploymentProvider;
//# sourceMappingURL=github.js.map