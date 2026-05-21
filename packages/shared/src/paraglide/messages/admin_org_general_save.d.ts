/**
* | output |
* | --- |
* | "Save changes" |
*
* @param {Admin_Org_General_SaveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_org_general_save: ((inputs?: Admin_Org_General_SaveInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Org_General_SaveInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Org_General_SaveInputs = {};
