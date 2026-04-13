/**
* | output |
* | --- |
* | "Unhold" |
*
* @param {Ticket_Action_UnholdInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_unhold: ((inputs?: Ticket_Action_UnholdInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Action_UnholdInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Action_UnholdInputs = {};
