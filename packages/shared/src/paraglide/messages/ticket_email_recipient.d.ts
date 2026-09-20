/**
* | output |
* | --- |
* | "To: {email}" |
*
* @param {Ticket_Email_RecipientInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_email_recipient: ((inputs: Ticket_Email_RecipientInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Email_RecipientInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Email_RecipientInputs = {
    email: NonNullable<unknown>;
};
