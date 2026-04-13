/**
* | output |
* | --- |
* | "Assign" |
*
* @param {Ticket_Action_AssignInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_assign: ((inputs?: Ticket_Action_AssignInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Action_AssignInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Action_AssignInputs = {};
