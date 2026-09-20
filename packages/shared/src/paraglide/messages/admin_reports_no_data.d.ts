/**
* | output |
* | --- |
* | "No report data yet" |
*
* @param {Admin_Reports_No_DataInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reports_no_data: ((inputs?: Admin_Reports_No_DataInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Reports_No_DataInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Reports_No_DataInputs = {};
