/**
* | output |
* | --- |
* | "Unhold" |
*
* @param {Ticket_Action_UnholdInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_action_unhold: ((inputs?: Ticket_Action_UnholdInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Action_UnholdInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Action_UnholdInputs = {};
