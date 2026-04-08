/**
* | output |
* | --- |
* | "View messages" |
*
* @param {Ticket_Action_MessagesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_action_messages: ((inputs?: Ticket_Action_MessagesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Action_MessagesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Action_MessagesInputs = {};
