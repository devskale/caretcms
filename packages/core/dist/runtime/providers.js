// virtual.d.ts declares the full export shape the integration generates — keep
// the two in sync (the vitest stub in tests/unit/stubs mirrors them too). The
// `Partial` wrapper below keeps runtime null-safety for environments that load
// this module without the Vite plugin (every access still has a fallback).
import * as runtimeProviders from "virtual:caretcms/providers";
import { registerPublishedStorage } from "./published-storage.js";
let runtimeServicesPromise = null;
let testServicesOverride = null;
const providerModule = runtimeProviders;
async function createAdapter() {
    if (testServicesOverride?.adapter) {
        return testServicesOverride.adapter;
    }
    const configuredAdapter = await providerModule?.loadConfiguredStorage?.();
    if (configuredAdapter) {
        return configuredAdapter;
    }
    throw new Error("[caretcms] No storage provider was configured for the active runtime mode.");
}
async function createUploadHandler() {
    if (testServicesOverride?.uploadHandler) {
        return testServicesOverride.uploadHandler;
    }
    const configuredUploadHandler = await providerModule?.loadConfiguredUploadHandler?.();
    if (configuredUploadHandler) {
        return configuredUploadHandler;
    }
    throw new Error("[caretcms] No upload provider was configured for the active runtime mode.");
}
async function createIdentityAdapter() {
    if (testServicesOverride?.identityAdapter)
        return testServicesOverride.identityAdapter;
    return await providerModule?.loadConfiguredIdentityAdapter?.() ?? null;
}
async function createDeploymentStatusProvider() {
    if (testServicesOverride?.deploymentStatusProvider)
        return testServicesOverride.deploymentStatusProvider;
    return await providerModule?.loadConfiguredDeploymentStatus?.() ?? null;
}
// One adapter instance for the process: the in-process locks and caches live on it.
let adapterPromise = null;
function sharedAdapter() {
    if (!adapterPromise) {
        const pending = createAdapter();
        pending.catch(() => {
            if (adapterPromise === pending)
                adapterPromise = null;
        });
        adapterPromise = pending;
    }
    return adapterPromise;
}
/** Only the configured storage, for reads outside a request (a static build). */
export function getStorageAdapter() {
    return sharedAdapter();
}
registerPublishedStorage(getStorageAdapter);
export async function getRuntimeServices() {
    if (!runtimeServicesPromise) {
        const inflight = Promise.all([
            sharedAdapter(),
            createUploadHandler(),
            createIdentityAdapter(),
            createDeploymentStatusProvider(),
        ]).then(([adapter, uploadHandler, identityAdapter, deploymentStatusProvider]) => ({
            adapter,
            uploadHandler,
            identityAdapter,
            deploymentStatusProvider,
            allowedClasses: testServicesOverride?.allowedClasses ?? providerModule?.allowedClasses ?? {},
            delivery: testServicesOverride?.delivery ??
                providerModule?.delivery ?? {
                mode: "server",
                bake: false,
                publish: { webhookUrl: null, method: "POST", headers: {} },
            },
            enableInlineEditor: testServicesOverride?.enableInlineEditor ??
                providerModule?.enableInlineEditor ??
                false,
            mountPath: testServicesOverride?.mountPath ?? providerModule?.mountPath ?? "/admin",
            apiBasePath: testServicesOverride?.apiBasePath ?? providerModule?.apiBasePath ?? "/api/cms",
        }));
        inflight.catch(() => {
            if (runtimeServicesPromise === inflight) {
                runtimeServicesPromise = null;
            }
        });
        runtimeServicesPromise = inflight;
    }
    return runtimeServicesPromise;
}
export function __setRuntimeServicesForTests(services) {
    testServicesOverride = services;
    runtimeServicesPromise = null;
    adapterPromise = null;
}
//# sourceMappingURL=providers.js.map