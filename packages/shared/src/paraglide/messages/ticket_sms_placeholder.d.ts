/**
* | output |
* | --- |
* | "Type your message..." |
*
* @param {Ticket_Sms_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_sms_placeholder: ((inputs?: Ticket_Sms_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Sms_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Sms_PlaceholderInputs = {};
