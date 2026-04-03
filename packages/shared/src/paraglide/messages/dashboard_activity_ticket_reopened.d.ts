/**
* | output |
* | --- |
* | "Reopened" |
*
* @param {Dashboard_Activity_Ticket_ReopenedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_ticket_reopened: ((inputs?: Dashboard_Activity_Ticket_ReopenedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Activity_Ticket_ReopenedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Activity_Ticket_ReopenedInputs = {};
