/**
* | output |
* | --- |
* | "Closed" |
*
* @param {Dashboard_Activity_Ticket_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_ticket_closed: ((inputs?: Dashboard_Activity_Ticket_ClosedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Activity_Ticket_ClosedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Activity_Ticket_ClosedInputs = {};
