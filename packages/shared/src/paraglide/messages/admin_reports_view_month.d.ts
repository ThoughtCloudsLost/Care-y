/**
* | output |
* | --- |
* | "{count} tickets this month, view filtered list" |
*
* @param {Admin_Reports_View_MonthInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reports_view_month: ((inputs: Admin_Reports_View_MonthInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Reports_View_MonthInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Reports_View_MonthInputs = {
    count: NonNullable<unknown>;
};
