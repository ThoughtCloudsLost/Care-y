/**
* | output |
* | --- |
* | "These entries configure the external channels the organization uses to communicate with clients, and the channel policy entry determines which of those chann..." |
*
* @param {Demo_Section_Admin_Comms_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_comms_desc: ((inputs?: Demo_Section_Admin_Comms_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Admin_Comms_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Admin_Comms_DescInputs = {};
