/**
* | output |
* | --- |
* | "Recent {Tickets}" |
*
* @param {Ticket_Recent_HistoryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_recent_history: ((inputs: Ticket_Recent_HistoryInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Recent_HistoryInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Recent_HistoryInputs = {
    Tickets: NonNullable<unknown>;
};
