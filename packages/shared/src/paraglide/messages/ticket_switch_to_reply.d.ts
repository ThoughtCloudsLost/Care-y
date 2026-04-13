/**
* | output |
* | --- |
* | "Switch to reply mode" |
*
* @param {Ticket_Switch_To_ReplyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_switch_to_reply: ((inputs?: Ticket_Switch_To_ReplyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Switch_To_ReplyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Switch_To_ReplyInputs = {};
