/**
* | output |
* | --- |
* | "Message is too long to send." |
*
* @param {Ticket_Email_Too_LongInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_email_too_long: ((inputs?: Ticket_Email_Too_LongInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Email_Too_LongInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Email_Too_LongInputs = {};
