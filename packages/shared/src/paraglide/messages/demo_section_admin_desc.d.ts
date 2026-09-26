/**
* | output |
* | --- |
* | "The admin hub holds the organization's settings and reporting pages, grouped into [People](#admin/hub-people), [Communications](#admin/hub-comms), [Organizat..." |
*
* @param {Demo_Section_Admin_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_desc: ((inputs?: Demo_Section_Admin_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Admin_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Admin_DescInputs = {};
