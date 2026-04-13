/**
* | output |
* | --- |
* | "Conversation with {alias}" |
*
* @param {Ticket_Conversation_WithInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_conversation_with: ((inputs: Ticket_Conversation_WithInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Conversation_WithInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Conversation_WithInputs = {
    alias: NonNullable<unknown>;
};
