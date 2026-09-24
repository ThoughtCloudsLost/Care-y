/**
* | output |
* | --- |
* | "SMS Templates" |
*
* @param {Admin_Tab_Sms_TemplatesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_tab_sms_templates: ((inputs?: Admin_Tab_Sms_TemplatesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Tab_Sms_TemplatesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Tab_Sms_TemplatesInputs = {};
