# Packaging — wie der Fork als `github:`-Dependency installiert wird

Stand: 2026-11-18 (nach der 11-Commit-Odyssee). Lies das, bevor du am
Release/Build/Packaging etwas änderst — jede Zeile hier ist ein Fehler, der
schon einmal passiert ist.

## Die Kette, die funktionieren muss

baumschneider (pnpm) → `github:devskale/caretcms#<hash>` → GitHub Tarball →
`prepare` läuft → `@caretcms/core` muss danach importierbar sein.

## Die Regeln (jede mit dem Fehler, den sie verhindert)

1. **`dist/` ist committet** (`packages/core/dist/`, Root-`.gitignore` erlaubt es).
   pnpm installiert die devDependencies von git-hosted deps NICHT — ein
   Build-on-install (`prepare` → `tsc`) kann daher nicht funktionieren.
   Nach Code-Änderungen: `npm run build:core` + dist mitcommitten.

2. **`prepare` toleriert fehlendes `.git`**: Tarball-Extracts haben kein
   `.git`; `git config core.hooksPath .githooks` stirbt mit exit 128 und
   reißt die ganze Installation mit.

3. **Root-`package.json` ist Facade für `packages/core`**: `main`/`types`/
   `exports` zeigen auf `packages/core/dist/…` — `@caretcms/core` resolved
   sonst ins Leere, weil der Tarball den Monorepo-Root liefert.

4. **`files`-Feld (Root)**: schließt `packages/core/{dist,src,static,tsconfigs,\n   scripts,editor-runtime.*}` ein. npm pack ehrt `.gitignore` — ohne
   `files` war `dist/` im Tarball schlicht nicht drin.

5. **`files` gehört auf Top-Level** neben `workspaces`, NICHT in `scripts`.
   (Ja, das ist passiert. `python3 -c "import json; …"` zum Verifizieren.)

6. **pnpm läuft `prepare`, nie `prepack`** — und braucht dafür den Tarball-\n   allowlist-Eintrag im Consumer (`pnpm-workspace.yaml` → `allowBuilds`, mit
   der vollen codeload-Tarball-URL inkl. Hash).

## Update-Prozedur im Consumer (baumschneider)

```bash
# 1. Fork bauen (dist committen, falls Code geändert wurde)
cd ~/code/clones/caretcms-ubu && npm run build:core && git add packages/core/dist && git commit -m "build: dist"
git push origin main && git rev-parse HEAD

# 2. Hash pinnen (package.json + pnpm-workspace.yaml allowBuilds-URL) + pnpm install
# 3. Verifizieren:
node --input-type=module -e "import { default as caret } from '@caretcms/core'; console.log(typeof caret)"
```
