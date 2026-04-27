/**
* | output |
* | --- |
* | "This text will be read aloud to callers using text-to-speech." |
*
* @param {Admin_Greetings_Tts_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_tts_hint: ((inputs?: Admin_Greetings_Tts_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Tts_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Tts_HintInputs = {};
