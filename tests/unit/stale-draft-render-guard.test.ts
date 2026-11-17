import { describe, expect, it } from "vitest";
import { InMemoryAdapter } from "../../packages/core/src/runtime/storage/in-memory-adapter";
import { SessionOverlayAdapter } from "../../packages/core/src/runtime/storage/session-overlay-adapter";
import { readDraftState } from "../../packages/core/src/runtime/draft-state";

/** Incident 1 ("Groundhog Day") render guard: a draft based on an older base
 *  revision never renders over newer repo content — the repo entry is served
 *  instead. The overlay keeps the draft (publish.ts still applies its
 *  stale_entry check; the editor surfaces the conflict). */

describe("stale-draft render guard — SessionOverlayAdapter.getEntry", () => {
  it("serves the fresh draft when the base is unchanged (no regression)", async () => {
    const base = new InMemoryAdapter();
    await base.writeEntry("pages", "home", { title: "Published", body: "b1" });

    const draft = new SessionOverlayAdapter(base, await base.makeEditorOverlay("editor-1"));
    await draft.writeEntry("pages", "home", { title: "Draft edit" });

    expect((await draft.getEntry("pages", "home"))?.data).toEqual({ title: "Draft edit" });
  });

  it("serves REPO content when the base advanced under a structured draft", async () => {
    const base = new InMemoryAdapter();
    await base.writeEntry("pages", "home", { title: "v1", hero: "old-hero.jpg" });

    const draft = new SessionOverlayAdapter(base, await base.makeEditorOverlay("editor-1"));
    await draft.writeEntry("pages", "home", { title: "v1-draft", hero: "old-hero.jpg" });

    // Der Entwickler ändert den Repo-Stand unter dem offenen Draft (Incident 1):
    await base.writeEntry("pages", "home", { title: "v2-repo", hero: "new-hero.jpg" });

    // Renderpfad: Repo-Inhalt, nicht der veraltete Draft
    expect((await draft.getEntry("pages", "home"))?.data).toEqual({ title: "v2-repo", hero: "new-hero.jpg" });
    // Der Draft bleibt im Overlay (Publish lehnt weiterhin mit stale_entry ab)
    expect((await draft.getOwnEntry("pages", "home"))?.data).toMatchObject({ title: "v1-draft" });
  });

  it("serves REPO content when the base advanced under a body-only draft", async () => {
    const base = new InMemoryAdapter();
    await base.writeEntry("pages", "home", { title: "v1", body: "b1" });

    const draft = new SessionOverlayAdapter(base, await base.makeEditorOverlay("editor-1"));
    await draft.writeBodyDraft("pages", "home", { body: "b1-draft" });

    await base.writeEntry("pages", "home", { title: "v2-repo", body: "b2-repo" });

    expect((await draft.getEntry("pages", "home"))?.data).toEqual({ title: "v2-repo", body: "b2-repo" });
  });

  it("serves the draft for a NEW entry that still does not exist in base", async () => {
    const base = new InMemoryAdapter();
    const draft = new SessionOverlayAdapter(base, await base.makeEditorOverlay("editor-1"));
    await draft.writeEntry("pages", "new-page", { title: "Draft on new page" });

    expect((await draft.getEntry("pages", "new-page"))?.data).toEqual({ title: "Draft on new page" });
    expect(await base.getEntry("pages", "new-page")).toBeNull();
  });

  it("tombstones keep hiding the base entry", async () => {
    const base = new InMemoryAdapter();
    await base.writeEntry("pages", "gone", { title: "Published" });

    const draft = new SessionOverlayAdapter(base, await base.makeEditorOverlay("editor-1"));
    await draft.deleteEntry("pages", "gone");
    expect(await draft.getEntry("pages", "gone")).toBeNull();
  });

  it("stale is recoverable: publishing the repo state clears the guard", async () => {
    const base = new InMemoryAdapter();
    await base.writeEntry("pages", "home", { title: "v1" });

    const draft = new SessionOverlayAdapter(base, await base.makeEditorOverlay("editor-1"));
    await draft.writeEntry("pages", "home", { title: "v1-draft" });
    await base.writeEntry("pages", "home", { title: "v2-repo" });
    expect((await draft.getEntry("pages", "home"))?.data).toEqual({ title: "v2-repo" });

    // Der Editor verwirft den veralteten Draft (explizit) → Overlay leer →
    // neue Edits basieren auf v2 und rendern wieder normal. (Der rohe Overlay-
    // Store lesen: getOwnEntry stript den Draft-State by design.)
    const overlayStore = await base.makeEditorOverlay("editor-1");
    await overlayStore.deleteEntry("pages", "home");
    await draft.writeEntry("pages", "home", { title: "v2-draft" });
    expect((await draft.getEntry("pages", "home"))?.data).toEqual({ title: "v2-draft" });
    const data = (await overlayStore.getEntry("pages", "home"))?.data ?? {};
    // Der neue Draft re-basiert auf dem aktuellen Repo-Stand:
    expect(readDraftState(data)?.baseData).toEqual({ title: "v2-repo" });
  });
});
