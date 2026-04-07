/**
* | output |
* | --- |
* | "REPLY" |
*
* @param {Ticket_Mode_ReplyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_mode_reply: ((inputs?: Ticket_Mode_ReplyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Mode_ReplyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Mode_ReplyInputs = {};
