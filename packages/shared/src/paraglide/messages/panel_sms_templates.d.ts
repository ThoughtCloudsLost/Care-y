/**
* | output |
* | --- |
* | "SMS Templates" |
*
* @param {Panel_Sms_TemplatesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_sms_templates: ((inputs?: Panel_Sms_TemplatesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_Sms_TemplatesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_Sms_TemplatesInputs = {};
