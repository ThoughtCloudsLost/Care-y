/**
* | output |
* | --- |
* | "Recent Tickets" |
*
* @param {Ticket_Recent_HistoryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_recent_history: ((inputs?: Ticket_Recent_HistoryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Recent_HistoryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Recent_HistoryInputs = {};
