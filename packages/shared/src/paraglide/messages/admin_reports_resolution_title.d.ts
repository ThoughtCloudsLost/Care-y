/**
* | output |
* | --- |
* | "Resolution time" |
*
* @param {Admin_Reports_Resolution_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reports_resolution_title: ((inputs?: Admin_Reports_Resolution_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Reports_Resolution_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Reports_Resolution_TitleInputs = {};
