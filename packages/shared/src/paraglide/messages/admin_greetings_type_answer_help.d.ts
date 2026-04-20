/**
* | output |
* | --- |
* | "This is what callers hear when they first connect." |
*
* @param {Admin_Greetings_Type_Answer_HelpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_answer_help: ((inputs?: Admin_Greetings_Type_Answer_HelpInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Type_Answer_HelpInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Type_Answer_HelpInputs = {};
