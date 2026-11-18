export const prerender = false;
import { clearEditorSessionCookie } from "../auth/session.js";
import { sanitizeRedirect } from "../auth/cookie-utils.js";
import { getRuntimeConfig } from "../config.js";
import { enforceContentLength, MAX_JSON_BODY_BYTES } from "./_helpers.js";
import { getRuntimeServices } from "../providers.js";
function redirect(pathname, setCookie) {
    const headers = { Location: pathname };
    if (setCookie)
        headers["Set-Cookie"] = setCookie;
    return new Response(null, { status: 302, headers });
}
function json(body, status = 200, setCookie) {
    const headers = {
        "Content-Type": "application/json; charset=utf-8",
    };
    if (setCookie)
        headers["Set-Cookie"] = setCookie;
    return new Response(JSON.stringify(body), { status, headers });
}
export async function POST(context) {
    const tooLarge = enforceContentLength(context.request, MAX_JSON_BODY_BYTES);
    if (tooLarge)
        return tooLarge;
    const runtime = getRuntimeConfig();
    const contentType = context.request.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const cookie = clearEditorSessionCookie("/", context.request);
    let redirectTo = context.url.searchParams.get("redirect");
    if (isJson) {
        const body = (await context.request.json().catch(() => null));
        redirectTo =
            typeof body?.redirect === "string" ? body.redirect : redirectTo;
    }
    else {
        const formData = await context.request.formData().catch(() => null);
        redirectTo =
            typeof formData?.get("redirect") === "string"
                ? formData?.get("redirect")
                : redirectTo;
    }
    const safeRedirect = sanitizeRedirect(redirectTo, runtime.mountPath);
    const identityAdapter = (await getRuntimeServices()).identityAdapter;
    const finalRedirect = identityAdapter?.logoutUrl
        ? await identityAdapter.logoutUrl({ request: context.request, redirectTo: safeRedirect })
        : safeRedirect;
    if (isJson)
        return json({ ok: true, redirect: finalRedirect }, 200, cookie);
    return redirect(finalRedirect, cookie);
}
export async function GET() {
    return json({
        error: "Method not allowed",
        allowedMethods: ["POST"],
    }, 405);
}
//# sourceMappingURL=auth-logout.js.map