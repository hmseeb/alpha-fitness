# Alpha Fitness — Release Process

This is an Electron app distributed to a Windows user (first gym owner). Auto-updates handled via electron-updater + GitHub Releases.

## Project facts

- Repo: https://github.com/hmseeb/alpha-fitness (public)
- Target: Windows x64 NSIS installer
- Owner of Supabase: hsbazr@gmail.com under `xkxlrtiovlmbdecjblpn` (Singapore)
- App data on Windows: `%APPDATA%/Alpha Fitness/`
- App data on macOS dev: `~/Library/Application Support/Alpha Fitness/`
- Anon key is hardcoded as fallback in `electron/supabase.ts` — fine because RLS protects data
- Session encrypted via Electron `safeStorage` at `session.bin`

## Shipping an update

```bash
# 1. make changes, commit
git commit -am "fix: <what changed>"

# 2. bump version in package.json (semver: patch/minor/major)
#    edit "version": "0.1.x"

# 3. commit version bump
git commit -am "chore: bump v0.1.x"

# 4. tag + push — CI does the rest
git tag v0.1.x
git push && git push --tags
```

GitHub Actions (`.github/workflows/release.yml`) on `windows-latest`:
- installs deps with `npm install` (NOT `npm ci` — lockfile generated on macOS misses Windows optional deps)
- runs `npm run build` (tsc + vite build)
- runs `npx electron-builder --win --publish always` with `GH_TOKEN`
- publishes `.exe` + `latest.yml` + `.blockmap` to GitHub Releases

Owner's installed app on launch:
- `autoUpdater.checkForUpdatesAndNotify()` polls Releases
- downloads new version silently in background
- installs on next quit
- also re-checks every 4 hours while open

## Common issues

- **Build fails on `npm ci`**: lockfile has cross-platform deps missing — we use `npm install` in CI
- **Node version warning from `@electron/rebuild`**: workflow uses Node 22
- **Mac dock label says "Electron" in dev**: normal — only the packaged `.app` shows "Alpha Fitness". On Windows the packaged installer always shows the correct name.
- **Better-sqlite3 native module**: `asarUnpack` in electron-builder config keeps it loadable from the asar bundle. `postinstall` runs `electron-rebuild` so dev works locally.

## Schema migrations (Supabase)

```bash
# write SQL in supabase/migrations/<timestamp>_<name>.sql
supabase db push
```

Local SQLite schema mirrors must be updated in `electron/db.ts` `initDb()` to match (CREATE TABLE IF NOT EXISTS).

## Stack

Electron 33 · React 18 · TS · Tailwind · better-sqlite3 11 · Supabase JS · electron-builder · electron-updater
