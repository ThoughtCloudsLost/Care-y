/**
* | output |
* | --- |
* | "Message sent by {name} at {time}" |
*
* @param {Ticket_Message_Sent_ByInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_message_sent_by: ((inputs: Ticket_Message_Sent_ByInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Message_Sent_ByInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Message_Sent_ByInputs = {
    name: NonNullable<unknown>;
    time: NonNullable<unknown>;
};
