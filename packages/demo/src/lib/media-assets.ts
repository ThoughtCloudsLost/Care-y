// Committed narrative media assets for the seeded story ticket.
// Regeneration: scripts/generate-voicemail-audio.sh (audio, macOS) and
// scripts/generate-doc-images/screenshot.mjs (images).
import voicemailUrl from "../assets/demo-voicemail-en.m4a?url";
import housingNoticeUrl from "../assets/demo-doc-housing-notice.jpg?url";
import appointmentCardUrl from "../assets/demo-doc-appointment-card.jpg?url";

// Measured from the generated clip (4.58 s); keep in sync when regenerating.
export const DEMO_VOICEMAIL_DURATION_S = 5;

export const DEMO_VOICEMAIL_URL: string = voicemailUrl;

export const DEMO_DOCUMENT_IMAGE_URLS: readonly {
  url: string;
  contentType: string;
}[] = [
  { url: housingNoticeUrl, contentType: "image/jpeg" },
  { url: appointmentCardUrl, contentType: "image/jpeg" },
];
