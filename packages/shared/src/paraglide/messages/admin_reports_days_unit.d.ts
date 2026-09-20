/**
* | output |
* | --- |
* | "{days}d" |
*
* @param {Admin_Reports_Days_UnitInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reports_days_unit: ((inputs: Admin_Reports_Days_UnitInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Reports_Days_UnitInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Reports_Days_UnitInputs = {
    days: NonNullable<unknown>;
};
