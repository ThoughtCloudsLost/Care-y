/**
* | output |
* | --- |
* | "Message received from {name} at {time}" |
*
* @param {Ticket_Message_Received_FromInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_message_received_from: ((inputs: Ticket_Message_Received_FromInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Message_Received_FromInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Message_Received_FromInputs = {
    name: NonNullable<unknown>;
    time: NonNullable<unknown>;
};
