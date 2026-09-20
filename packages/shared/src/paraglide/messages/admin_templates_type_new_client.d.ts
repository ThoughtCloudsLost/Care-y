/**
* | output |
* | --- |
* | "Auto-reply" |
*
* @param {Admin_Templates_Type_New_ClientInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_templates_type_new_client: ((inputs?: Admin_Templates_Type_New_ClientInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Templates_Type_New_ClientInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Templates_Type_New_ClientInputs = {};
