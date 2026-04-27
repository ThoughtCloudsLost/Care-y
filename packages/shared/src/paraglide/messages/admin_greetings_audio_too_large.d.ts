/**
* | output |
* | --- |
* | "Audio file must be under 5 MB." |
*
* @param {Admin_Greetings_Audio_Too_LargeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_audio_too_large: ((inputs?: Admin_Greetings_Audio_Too_LargeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Audio_Too_LargeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Audio_Too_LargeInputs = {};
