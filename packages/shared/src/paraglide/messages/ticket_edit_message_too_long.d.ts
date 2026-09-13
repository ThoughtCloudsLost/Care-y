/**
* | output |
* | --- |
* | "This message is too long." |
*
* @param {Ticket_Edit_Message_Too_LongInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_edit_message_too_long: ((inputs?: Ticket_Edit_Message_Too_LongInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Edit_Message_Too_LongInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Edit_Message_Too_LongInputs = {};
