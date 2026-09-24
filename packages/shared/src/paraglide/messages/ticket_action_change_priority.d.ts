/**
* | output |
* | --- |
* | "Change priority" |
*
* @param {Ticket_Action_Change_PriorityInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_action_change_priority: ((inputs?: Ticket_Action_Change_PriorityInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Action_Change_PriorityInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Action_Change_PriorityInputs = {};
