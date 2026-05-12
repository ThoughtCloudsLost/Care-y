/**
* | output |
* | --- |
* | "{Tickets}" |
*
* @param {Admin_Reports_Tickets_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reports_tickets_label: ((inputs: Admin_Reports_Tickets_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Reports_Tickets_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Reports_Tickets_LabelInputs = {
    Tickets: NonNullable<unknown>;
};
