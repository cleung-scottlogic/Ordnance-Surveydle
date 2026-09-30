# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Ordnance Surveydle" (aka "osdle", live at osdle.kaiming.uk) — a daily Wordle-style geography guessing game. Players are shown a historical Ordnance Survey map (National Library of Scotland tiles) zoomed tightly on a random UK location and must click a point on a modern OpenStreetMap to guess where it is. Each wrong guess zooms the historical map out one level, revealing more context, for up to 5 guesses.

## Commands

- `npm run dev` — start the Vite dev server.
- `npm run build` — `tsc -b && vite build` (type-checks via project references, then bundles). There is no separate typecheck script; use this or `npx tsc --noEmit -p tsconfig.app.json` to check types without a full build.
- `npm run lint` — `vp lint` (vite-plus's linter, not raw `eslint`).
- `npm run preview` — preview the production build locally.
- There is no test runner/framework configured in this project.
- Formatting follows `.prettierrc`: single quotes for both JS and JSX (`singleQuote`, `jsxSingleQuote`).

## Architecture

### Game loop (`App.tsx`)

The central state (`guesses`, `currentGuessLocation`, `endScreenOpen`, `progressCollapsed`, etc.) lives in `App.tsx` and drives two side-by-side Leaflet maps rendered via the shared `Map/MapView.tsx`:

- **Top map**: the historical NLS tile layer, centered on the answer. Its zoom level is looked up from `Map/ZoomLevel.tsx`'s `ZOOM_LEVELS` array by `guesses.length` — each guess zooms out one step (max zoom 16 down to 8), and `key={guesses.length}` forces a remount to apply it.
- **Bottom map**: modern OSM tiles where the player clicks to place a guess (`isCustomMarkerEnabled`), showing all previous guesses as markers.
- A guess is "perfect" (score 1000, distance ≤ 100m) or the 5th guess ends the game (`isGameOver`), opening `EndScreen`.

`MapView.tsx` composes several small `useMap()`-based controller components (`MapController` for fly/pan-to-fixed-marker, `RecenterButton`, `PanController`, `ResizeInvalidator` for the draggable map-splitter) around `react-leaflet`'s `MapContainer`, delegating actual marker rendering to `Map/LocationMarker.tsx`.

The left `Progress` sidebar shows a strip of 5 guess-distance placeholders (clicking one pans the bottom map back to that guess) and auto-expands whenever `EndScreen` opens.

### Daily puzzle (`DataService.tsx`)

The client does not generate or pick the day's location itself. A backend Lambda (also not in this repo) chooses it and writes a GBPN gazetteer record (https://gazetteer.org.uk) to the public S3 object `ckl-mapgame-daily-seeds-*/location`. `AwsService.fetchDailyLocation` fetches that record with `cache: 'no-store'` as `RawDailyLocation`, which has space-separated keys and string lat/lng. `DataService.fetchDailyLocation` then maps it to the camelCase `DailyLocation` that the app uses.

Rerolls: the admin page is served from the same bundle. `main.tsx` renders `AdminPage` instead of `App` when the path is `/admin`. From there, `triggerSeedReroll` stores the offset in `localStorage` under `mapgame:seedOffset` and POSTs `{ reroll }` to `VITE_REROLL_LAMBDA_URL`, which regenerates the S3 object. Any other open game tab picks up the change through the `storage` event and resets to the new location.

### Configuration

Tile-layer URLs, attributions and Lambda URLs come from `VITE_*` env vars in `.env`, which is committed to the repo: `VITE_OSM_TILELAYER`, `VITE_HISTORICAL_TILELAYER`, `VITE_SAVE_GAME_RESULT_LAMBDA_URL`, `VITE_REROLL_LAMBDA_URL`, etc. The S3 bucket URL is hardcoded in `AwsService.tsx`.

The React Compiler is enabled through `@rolldown/plugin-babel` in `vite.config.ts`, so manual `useMemo`/`useCallback` is usually unnecessary.

### Scoring (`ScoringService.tsx`)

Single source of truth for all distance/score math: `getDistanceMeters`/`getDistanceKm` (Leaflet's `distanceTo`), `calculateScore` (linear interpolation from 1000 pts at ≤100m down to 0 at ≥300km), and `formatDistance` (renders meters with no decimals under 1km, kilometers with 2 decimals at/above it — used anywhere a distance is shown to the player).

### Results, persistence & leaderboard

- `Scores/Score.tsx` is the payload shape sent to the backend. Its `id` is deterministically `player + date` (calendar day only, not a timestamp) so that a same-day resubmission collides with the existing row instead of creating a duplicate.
- `Aws/AwsService.tsx` wraps the save/leaderboard HTTP calls against a single Lambda Function URL (`VITE_SAVE_GAME_RESULT_LAMBDA_URL`): `POST` saves a result (throws `AlreadySubmittedError` on a `409`), `GET` returns the day's leaderboard.
- `StorageService.tsx` persists client-side state in `localStorage`. `mapgame:dailyGame` holds today's guesses plus a `submittedName` once the result has been submitted. It is saved after every guess and restored on load; a finished game reopens straight into `EndScreen`. A saved game only applies while its `locationId` matches the fetched `DailyLocation.id`, so a new day or a reroll starts fresh. `mapgame:playerName` remembers the last submitted name across days. Player names are always lower-cased through `normalisePlayerName`.
- `Leaderboard/Leaderboard.tsx` renders that leaderboard inside `EndScreen`, ranked (server-side) primarily by fewest guesses, then by closest distance.
- **The Lambda source is not part of this git repo.** It's edited live via the AWS Toolkit VS Code extension, which opens it as a temp file at `%LOCALAPPDATA%\Temp\aws-toolkit-vscode\lambda\eu-west-2\save-osdle-score\index.mjs`; changes must be redeployed through that extension (Deploy codelens or AWS Explorer → "Upload Lambda...") to take effect. It writes to a DynamoDB table `osdleScores` whose primary key is composite: partition `id`, sort `date`. Because of this, `date` must stay truncated to the same calendar-day string as `id` — if it carries full timestamp precision, duplicate-prevention (`ConditionExpression: attribute_not_exists(id)`) silently stops working, since every write lands on a "new" `(id, date)` pair.

### Deployment

`.github/workflows/deploy.yaml` builds the app and syncs `dist/` to an S3 bucket on push/PR to the **`prod`** branch (not `main`).

### Conventions

- Each feature lives in its own `src/<Feature>/` folder with a colocated `.tsx` + `.css` (e.g. `Progress/`, `Admin/`, `Leaderboard/`, `EndScreen/`). Follow this layout for new features rather than adding to a shared components folder.
- Dark theme CSS custom properties (`--primary`, `--secondary`, `--surface`, `--panel`, etc.) are defined once in `src/index.css` and reused across feature stylesheets.
