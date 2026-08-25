#!/usr/bin/env bash
# Regenerates the demo audio clips in src/assets. macOS only (say + afconvert).
#   demo-voicemail-en.m4a  - voicemail clip played by seeded ticket voicemails
#   demo-greeting-en.m4a   - English phone greeting for the admin Greetings demo
# The measured voicemail duration must be kept in sync with
# DEMO_VOICEMAIL_DURATION_S (see src/lib/media-assets.ts).
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p src/assets

generate() {
  local voice="$1" text="$2" out="$3"
  local tmp_aiff
  tmp_aiff="$(mktemp -t demo-audio).aiff"
  say -v "$voice" -o "$tmp_aiff" "$text"
  afconvert -f m4af -d aac -b 48000 "$tmp_aiff" "$out"
  rm -f "$tmp_aiff"
  afinfo "$out" | grep -E "estimated duration|audio bytes"
  echo "Wrote $out"
}

# "Carey" (not "CARE-Y") so the voice says the name instead of "care why".
generate "Samantha" \
  "This is an example voicemail, generated for the Carey interactive handbook." \
  "src/assets/demo-voicemail-en.m4a"

# Matches the seeded English answer greeting on the crisis line.
generate "Samantha" \
  "You have reached our crisis line. A trained volunteer is available to help." \
  "src/assets/demo-greeting-en.m4a"
