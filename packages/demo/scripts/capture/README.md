# Demo capture pipeline

Records the demo app in a headless browser via CDP screencast, then
encodes two derivatives per subsection:

1. **VP9/WebM region clip** cropped to the subsection's content area,
   output to `packages/demo/public/clips/<sectionId>/<subSlug>.webm`.
   These are served by Vite at runtime and referenced by the clip
   registry (`src/lib/clip-registry.ts`).

2. **README GIF** (optional, `--gif`) showing the full phone with bezel,
   transparent outside a geometric rounded-rect mask, with a 3px
   loop-progress bar on the chin. Output to
   `docs/images/demos/<section>-<sub>.gif` at the repo root.

Both derivatives come from a single master recording per subsection.

## Prerequisites

```
brew install ffmpeg gifski
```

`ffmpeg` is required for all captures. `gifski` is required only when
`--gif` is passed. The script checks for both at startup and exits
with an actionable message if either is missing.

Playwright (via `@playwright/test` at the repo root) drives the
browser. No additional npm install is needed.

## Running

The demo must be running before you start the capture. Either build
and preview:

```bash
pnpm --filter @care-y/demo run build
npx vite preview --port 4173       # or whichever port you choose
```

Or start the dev server yourself and pass its URL via `--url`.

Then run the capture:

```bash
# Capture all subsections (VP9/WebM clips only)
node packages/demo/scripts/capture/capture-clips.mjs

# Capture a single subsection
node packages/demo/scripts/capture/capture-clips.mjs --only login/credentials

# Capture with GIF output
node packages/demo/scripts/capture/capture-clips.mjs --gif

# Keep master frame directories for inspection
node packages/demo/scripts/capture/capture-clips.mjs --keep-master
```

## CLI flags

| Flag            | Default                 | Description                                           |
| --------------- | ----------------------- | ----------------------------------------------------- |
| `--url <url>`   | `http://localhost:4173` | URL where the demo is running                         |
| `--only <key>`  | (all)                   | Capture a single subsection, e.g. `login/credentials` |
| `--gif`         | off                     | Also produce README GIF derivatives via gifski        |
| `--keep-master` | off                     | Retain master frame directories after encoding        |
| `--help`        |                         | Show usage                                            |

## Record mode

The capture script loads each subsection with `?record=1` appended to
the URL. This query parameter activates record mode in the demo app,
which flattens the backdrop behind the phone frame and freezes
time-dependent elements (status bar clock, relative timestamps) for
consistent recordings across runs.

Record mode is wired by a separate agent; this script references the
parameter but does not implement the presentation changes.

## Outputs

**WebM clips** land in `packages/demo/public/clips/`. Vite serves
files from `public/` at the app's base URL, so the clip registry finds
them at `clips/<sectionId>/<subSlug>.webm` without further
configuration.

**GIF files** (when `--gif` is used) land in `docs/images/demos/` at
the repo root.

**Master frames** are written to a temporary directory under
`os.tmpdir()` and deleted after encoding unless `--keep-master` is
passed.

## Crop registry

Each subsection's crop region is defined in
`scripts/capture/crop-registry.mjs`. Entries specify:

- `selector`: a CSS selector resolved inside the phone iframe at
  capture time. When an element is found, its bounding box becomes the
  crop rect. This tracks the UI automatically.
- `fallbackRect`: a hand-authored rect in phone-viewport space
  (0,0 = top-left of the phone's content area). Used when the selector
  is null or the element is not found.
- `scroll`: (reserved) when true, the capture records one subsection
  of scroll travel.

All entries currently use the spec's default fallback rect (390x220
near the top of the viewport). Per-sub tuning is a later pass.

## Architecture

Helpers are pure functions with colocated vitest tests:

- `concat-demuxer.mjs` - concat demuxer file generation from frame
  timestamp lists
- `ffmpeg-args.mjs` - argument builders for VP9 clips, gifski frame
  extraction, the geq rounded-rect mask, and the loop-progress bar
- `crop-resolve.mjs` - crop rect resolution (named element or authored
  fallback) with phone-rect clamping
- `crop-registry.mjs` - per-subsection crop strategies

Tests run through the demo package's vitest config. They do not invoke
ffmpeg, gifski, or any browser.
