/**
* | output |
* | --- |
* | "Open {tickets}" |
*
* @param {Admin_Reports_Open_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reports_open_tickets: ((inputs: Admin_Reports_Open_TicketsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Reports_Open_TicketsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Reports_Open_TicketsInputs = {
    tickets: NonNullable<unknown>;
    Tickets: NonNullable<unknown>;
};
