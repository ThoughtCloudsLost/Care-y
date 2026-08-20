/**
* | output |
* | --- |
* | "The admin hub is the landing page for organization management. It groups the management pages into People, Communications, Organization, and Analytics cards,..." |
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
