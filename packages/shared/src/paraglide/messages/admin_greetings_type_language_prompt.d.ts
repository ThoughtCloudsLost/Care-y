/**
* | output |
* | --- |
* | "Language selection" |
*
* @param {Admin_Greetings_Type_Language_PromptInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_language_prompt: ((inputs?: Admin_Greetings_Type_Language_PromptInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Type_Language_PromptInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Type_Language_PromptInputs = {};
