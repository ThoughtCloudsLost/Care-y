/**
* | output |
* | --- |
* | "Email sent" |
*
* @param {Ticket_Timeline_Email_Sent_PlainInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_email_sent_plain: ((inputs?: Ticket_Timeline_Email_Sent_PlainInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Timeline_Email_Sent_PlainInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Timeline_Email_Sent_PlainInputs = {};
