/**
* | output |
* | --- |
* | "Starting call..." |
*
* @param {Ticket_Call_InitiatingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_call_initiating: ((inputs?: Ticket_Call_InitiatingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Call_InitiatingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Call_InitiatingInputs = {};
