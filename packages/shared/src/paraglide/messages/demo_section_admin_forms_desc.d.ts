/**
* | output |
* | --- |
* | "Custom intake forms let organizations collect the information their workflow needs. Each form feeds a destination queue so tickets land in the right place au..." |
*
* @param {Demo_Section_Admin_Forms_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_forms_desc: ((inputs?: Demo_Section_Admin_Forms_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Admin_Forms_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Admin_Forms_DescInputs = {};
