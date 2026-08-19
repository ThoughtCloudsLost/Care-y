/**
* | output |
* | --- |
* | "The organization page holds settings that shape the whole workspace. General info, branding, and terminology are encrypted with the organization key before s..." |
*
* @param {Demo_Section_Admin_Org_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_org_desc: ((inputs?: Demo_Section_Admin_Org_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Admin_Org_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Admin_Org_DescInputs = {};
