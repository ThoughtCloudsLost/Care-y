/**
* | output |
* | --- |
* | "{Ticket} activity" |
*
* @param {Dashboard_Activity_Kind_TicketInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_kind_ticket: ((inputs: Dashboard_Activity_Kind_TicketInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Activity_Kind_TicketInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Activity_Kind_TicketInputs = {
    Ticket: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
};
