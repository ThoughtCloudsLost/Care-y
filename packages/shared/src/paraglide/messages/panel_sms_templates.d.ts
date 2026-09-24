/**
* | output |
* | --- |
* | "SMS Templates" |
*
* @param {Panel_Sms_TemplatesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_sms_templates: ((inputs?: Panel_Sms_TemplatesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_Sms_TemplatesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_Sms_TemplatesInputs = {};
