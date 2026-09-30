/**
* | output |
* | --- |
* | "The logs page holds a call history tab and an audit log tab. Each tab lists plaintext metadata with one name per row that the browser decrypts from organizat..." |
*
* @param {Demo_Section_Admin_Logs_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_logs_desc: ((inputs?: Demo_Section_Admin_Logs_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Admin_Logs_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Admin_Logs_DescInputs = {};
