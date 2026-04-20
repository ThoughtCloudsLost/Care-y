/**
* | output |
* | --- |
* | "Sent automatically to every incoming text message. Lets the sender know their message was received and a volunteer will follow up." |
*
* @param {Admin_Templates_Type_New_Client_HelpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_templates_type_new_client_help: ((inputs?: Admin_Templates_Type_New_Client_HelpInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Templates_Type_New_Client_HelpInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Templates_Type_New_Client_HelpInputs = {};
