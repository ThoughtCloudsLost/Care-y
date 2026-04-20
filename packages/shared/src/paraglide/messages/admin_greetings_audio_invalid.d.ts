/**
* | output |
* | --- |
* | "File is not a valid audio format. Use WAV, MP3, OGG, or M4A." |
*
* @param {Admin_Greetings_Audio_InvalidInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_audio_invalid: ((inputs?: Admin_Greetings_Audio_InvalidInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Audio_InvalidInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Audio_InvalidInputs = {};
