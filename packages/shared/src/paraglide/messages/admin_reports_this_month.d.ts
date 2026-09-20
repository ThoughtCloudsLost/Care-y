/**
* | output |
* | --- |
* | "This month" |
*
* @param {Admin_Reports_This_MonthInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reports_this_month: ((inputs?: Admin_Reports_This_MonthInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Reports_This_MonthInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Reports_This_MonthInputs = {};
