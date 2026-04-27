/**
* | output |
* | --- |
* | "{count} open tickets, view filtered list" |
*
* @param {Admin_Reports_View_OpenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reports_view_open: ((inputs: Admin_Reports_View_OpenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Reports_View_OpenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Reports_View_OpenInputs = {
    count: NonNullable<unknown>;
};
