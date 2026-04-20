/**
* | output |
* | --- |
* | "Returning caller" |
*
* @param {Admin_Greetings_Type_Existing_ClientInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_type_existing_client: ((inputs?: Admin_Greetings_Type_Existing_ClientInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Type_Existing_ClientInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Type_Existing_ClientInputs = {};
