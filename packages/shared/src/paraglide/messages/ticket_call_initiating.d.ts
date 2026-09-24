/**
* | output |
* | --- |
* | "Starting call..." |
*
* @param {Ticket_Call_InitiatingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_call_initiating: ((inputs?: Ticket_Call_InitiatingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Call_InitiatingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Call_InitiatingInputs = {};
