/**
* | output |
* | --- |
* | "Upload a WAV, MP3, OGG, or M4A file (max 5 MB). This recording will play to callers." |
*
* @param {Admin_Greetings_Audio_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_audio_hint: ((inputs?: Admin_Greetings_Audio_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Audio_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Audio_HintInputs = {};
