/**
* | output |
* | --- |
* | "replying via encrypted care-y portal" |
*
* @param {Ticket_Mode_Indicator_ReplyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_mode_indicator_reply: ((inputs?: Ticket_Mode_Indicator_ReplyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Mode_Indicator_ReplyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Mode_Indicator_ReplyInputs = {};
