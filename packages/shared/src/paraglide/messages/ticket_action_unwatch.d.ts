/**
* | output |
* | --- |
* | "Unwatch" |
*
* @param {Ticket_Action_UnwatchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_action_unwatch: ((inputs?: Ticket_Action_UnwatchInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Action_UnwatchInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Action_UnwatchInputs = {};
