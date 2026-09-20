/**
* | output |
* | --- |
* | "Enter to send, Shift+Enter for new line" |
*
* @param {Ticket_Compose_Enter_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_compose_enter_hint: ((inputs?: Ticket_Compose_Enter_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Compose_Enter_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Compose_Enter_HintInputs = {};
