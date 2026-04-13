/**
* | output |
* | --- |
* | "Reopen" |
*
* @param {Ticket_Action_ReopenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_reopen: ((inputs?: Ticket_Action_ReopenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Action_ReopenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Action_ReopenInputs = {};
