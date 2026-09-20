/**
* | output |
* | --- |
* | "Type a message..." |
*
* @param {Ticket_Compose_Sms_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_compose_sms_placeholder: ((inputs?: Ticket_Compose_Sms_PlaceholderInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Compose_Sms_PlaceholderInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Compose_Sms_PlaceholderInputs = {};
