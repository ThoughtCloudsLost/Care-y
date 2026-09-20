/**
* | output |
* | --- |
* | "Email sent" |
*
* @param {Ticket_Timeline_Email_Sent_PlainInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_email_sent_plain: ((inputs?: Ticket_Timeline_Email_Sent_PlainInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Timeline_Email_Sent_PlainInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Timeline_Email_Sent_PlainInputs = {};
