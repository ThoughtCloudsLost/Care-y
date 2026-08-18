/**
* | output |
* | --- |
* | "The people page manages everyone the organization works with. Administrators maintain the volunteer roster and roles, configure the queues that organize and ..." |
*
* @param {Demo_Section_Admin_People_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_people_desc: ((inputs?: Demo_Section_Admin_People_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Admin_People_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Admin_People_DescInputs = {};
