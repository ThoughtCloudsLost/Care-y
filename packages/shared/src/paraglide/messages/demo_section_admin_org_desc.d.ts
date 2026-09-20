/**
* | output |
* | --- |
* | "These entries cover settings that shape the whole workspace rather than any one ticket or person. General info and branding are stored without encryption so ..." |
*
* @param {Demo_Section_Admin_Org_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_org_desc: ((inputs?: Demo_Section_Admin_Org_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Admin_Org_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Admin_Org_DescInputs = {};
