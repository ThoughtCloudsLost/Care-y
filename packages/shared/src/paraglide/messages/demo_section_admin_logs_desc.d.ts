/**
* | output |
* | --- |
* | "The logs page combines call history and audit events behind two tabs. The call tab lists telephony entries already stored on tickets, and the audit tab recor..." |
*
* @param {Demo_Section_Admin_Logs_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_logs_desc: ((inputs?: Demo_Section_Admin_Logs_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Admin_Logs_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Admin_Logs_DescInputs = {};
