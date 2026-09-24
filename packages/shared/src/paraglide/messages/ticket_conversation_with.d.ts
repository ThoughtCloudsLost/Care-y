/**
* | output |
* | --- |
* | "Conversation with {alias}" |
*
* @param {Ticket_Conversation_WithInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_conversation_with: ((inputs: Ticket_Conversation_WithInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Conversation_WithInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Conversation_WithInputs = {
    alias: NonNullable<unknown>;
};
