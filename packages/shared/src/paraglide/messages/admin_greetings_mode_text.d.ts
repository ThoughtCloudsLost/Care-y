/**
* | output |
* | --- |
* | "Text" |
*
* @param {Admin_Greetings_Mode_TextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_mode_text: ((inputs?: Admin_Greetings_Mode_TextInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Mode_TextInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Mode_TextInputs = {};
