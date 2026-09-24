/**
* | output |
* | --- |
* | "This message is too long." |
*
* @param {Ticket_Edit_Message_Too_LongInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_edit_message_too_long: ((inputs?: Ticket_Edit_Message_Too_LongInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Edit_Message_Too_LongInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Edit_Message_Too_LongInputs = {};
