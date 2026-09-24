/**
* | output |
* | --- |
* | "Message sent by {name} at {time}" |
*
* @param {Ticket_Message_Sent_ByInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_message_sent_by: ((inputs: Ticket_Message_Sent_ByInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Message_Sent_ByInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Message_Sent_ByInputs = {
    name: NonNullable<unknown>;
    time: NonNullable<unknown>;
};
