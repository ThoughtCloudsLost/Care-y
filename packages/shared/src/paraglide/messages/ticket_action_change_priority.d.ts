/**
* | output |
* | --- |
* | "Change priority" |
*
* @param {Ticket_Action_Change_PriorityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_change_priority: ((inputs?: Ticket_Action_Change_PriorityInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Action_Change_PriorityInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Action_Change_PriorityInputs = {};
