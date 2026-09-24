/**
* | output |
* | --- |
* | "The form builder is where intake forms are authored, localized, previewed, and configured. Form definitions are encrypted under a key anyone can derive from ..." |
*
* @param {Demo_Section_Admin_Forms_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_forms_desc: ((inputs?: Demo_Section_Admin_Forms_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Admin_Forms_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Admin_Forms_DescInputs = {};
