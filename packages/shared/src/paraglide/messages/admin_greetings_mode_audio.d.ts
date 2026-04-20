/**
* | output |
* | --- |
* | "Audio" |
*
* @param {Admin_Greetings_Mode_AudioInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_mode_audio: ((inputs?: Admin_Greetings_Mode_AudioInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Mode_AudioInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Mode_AudioInputs = {};
