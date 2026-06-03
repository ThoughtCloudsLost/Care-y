/**
* | output |
* | --- |
* | "New {ticket}" |
*
* @param {Dashboard_Activity_Ticket_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_ticket_created: ((inputs: Dashboard_Activity_Ticket_CreatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Activity_Ticket_CreatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Activity_Ticket_CreatedInputs = {
    ticket: NonNullable<unknown>;
    Ticket: NonNullable<unknown>;
};
