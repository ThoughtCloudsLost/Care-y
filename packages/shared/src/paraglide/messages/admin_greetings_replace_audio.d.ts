/**
* | output |
* | --- |
* | "Replace audio" |
*
* @param {Admin_Greetings_Replace_AudioInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_replace_audio: ((inputs?: Admin_Greetings_Replace_AudioInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Replace_AudioInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Replace_AudioInputs = {};
