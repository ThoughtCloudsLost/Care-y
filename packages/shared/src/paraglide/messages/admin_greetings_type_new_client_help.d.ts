/**
* | output |
* | --- |
* | "Played for callers who have never called before." |
*
* @param {Admin_Greetings_Type_New_Client_HelpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_new_client_help: ((inputs?: Admin_Greetings_Type_New_Client_HelpInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Type_New_Client_HelpInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Type_New_Client_HelpInputs = {};
