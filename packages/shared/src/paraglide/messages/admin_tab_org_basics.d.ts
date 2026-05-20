/**
* | output |
* | --- |
* | "Basics" |
*
* @param {Admin_Tab_Org_BasicsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_org_basics: ((inputs?: Admin_Tab_Org_BasicsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Tab_Org_BasicsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Tab_Org_BasicsInputs = {};
