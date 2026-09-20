/**
* | output |
* | --- |
* | "Average resolution time in days over the last 12 months" |
*
* @param {Admin_Reports_Resolution_AriaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reports_resolution_aria: ((inputs?: Admin_Reports_Resolution_AriaInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Reports_Resolution_AriaInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Reports_Resolution_AriaInputs = {};
