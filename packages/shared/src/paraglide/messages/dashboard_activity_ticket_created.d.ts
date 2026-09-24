/**
* | output |
* | --- |
* | "New {ticket}" |
*
* @param {Dashboard_Activity_Ticket_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_ticket_created: ((inputs: Dashboard_Activity_Ticket_CreatedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Activity_Ticket_CreatedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Activity_Ticket_CreatedInputs = {
    ticket: NonNullable<unknown>;
    Ticket: NonNullable<unknown>;
};
