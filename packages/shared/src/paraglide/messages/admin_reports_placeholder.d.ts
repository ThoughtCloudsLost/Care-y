/**
* | output |
* | --- |
* | "Coming in a future update" |
*
* @param {Admin_Reports_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reports_placeholder: ((inputs?: Admin_Reports_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Reports_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Reports_PlaceholderInputs = {};
