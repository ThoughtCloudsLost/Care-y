/**
* | output |
* | --- |
* | "First-time caller" |
*
* @param {Admin_Greetings_Type_New_ClientInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_new_client: ((inputs?: Admin_Greetings_Type_New_ClientInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Type_New_ClientInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Type_New_ClientInputs = {};
