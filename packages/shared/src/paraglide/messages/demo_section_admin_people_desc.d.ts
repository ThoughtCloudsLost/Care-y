/**
* | output |
* | --- |
* | "The people page covers everyone the organization works with and how they are organized. It holds the user roster, role and permission configuration, queue ma..." |
*
* @param {Demo_Section_Admin_People_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_people_desc: ((inputs?: Demo_Section_Admin_People_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Admin_People_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Admin_People_DescInputs = {};
