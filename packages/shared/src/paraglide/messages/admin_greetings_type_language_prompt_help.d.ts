/**
* | output |
* | --- |
* | "Played when the caller needs to select a language." |
*
* @param {Admin_Greetings_Type_Language_Prompt_HelpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_language_prompt_help: ((inputs?: Admin_Greetings_Type_Language_Prompt_HelpInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Type_Language_Prompt_HelpInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Type_Language_Prompt_HelpInputs = {};
