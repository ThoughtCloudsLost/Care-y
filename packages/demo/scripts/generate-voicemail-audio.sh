#!/usr/bin/env bash
# Regenerates src/assets/demo-voicemail-en.m4a. macOS only (say + afconvert).
# The measured duration must be kept in sync with DEMO_VOICEMAIL_DURATION_S
# (see src/lib/media-assets.ts).
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p src/assets

TEXT="This is an example voicemail, generated for the CARE-Y interactive handbook."
TMP_AIFF="$(mktemp -t demo-voicemail).aiff"
OUT="src/assets/demo-voicemail-en.m4a"

say -v "Samantha" -o "$TMP_AIFF" "$TEXT"
afconvert -f m4af -d aac -b 48000 "$TMP_AIFF" "$OUT"
rm -f "$TMP_AIFF"

afinfo "$OUT" | grep -E "estimated duration|audio bytes"
echo "Wrote $OUT"
