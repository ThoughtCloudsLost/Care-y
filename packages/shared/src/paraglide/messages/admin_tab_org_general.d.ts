/**
* | output |
* | --- |
* | "General" |
*
* @param {Admin_Tab_Org_GeneralInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_org_general: ((inputs?: Admin_Tab_Org_GeneralInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Tab_Org_GeneralInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Tab_Org_GeneralInputs = {};
