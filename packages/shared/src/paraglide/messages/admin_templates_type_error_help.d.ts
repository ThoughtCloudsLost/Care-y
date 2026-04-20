/**
* | output |
* | --- |
* | "Sent when the system cannot process an incoming message." |
*
* @param {Admin_Templates_Type_Error_HelpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_type_error_help: ((inputs?: Admin_Templates_Type_Error_HelpInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Templates_Type_Error_HelpInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Templates_Type_Error_HelpInputs = {};
