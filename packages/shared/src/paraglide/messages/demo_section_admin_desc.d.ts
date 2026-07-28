/**
* | output |
* | --- |
* | "The admin hub gives managers a bird's-eye view of the organization: active volunteers, queues, phone lines, and communication templates. Every count shown he..." |
*
* @param {Demo_Section_Admin_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_desc: ((inputs?: Demo_Section_Admin_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Admin_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Admin_DescInputs = {};
