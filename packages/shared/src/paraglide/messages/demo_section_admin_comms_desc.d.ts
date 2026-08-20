/**
* | output |
* | --- |
* | "The communications page configures how the organization talks to clients by phone and text. It covers phone lines and their greetings, SMS templates, the blo..." |
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
