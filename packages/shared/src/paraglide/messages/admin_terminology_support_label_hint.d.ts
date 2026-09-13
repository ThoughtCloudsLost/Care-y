/**
* | output |
* | --- |
* | "Shown above every message you send in the client portal. Use your organization's own words. Leave it empty to keep the default. Never put a volunteer's name ..." |
*
* @param {Admin_Terminology_Support_Label_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_support_label_hint: ((inputs?: Admin_Terminology_Support_Label_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Terminology_Support_Label_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Terminology_Support_Label_HintInputs = {};
