/**
* | output |
* | --- |
* | "Email sent: {subject}" |
*
* @param {Ticket_Timeline_Email_SentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_email_sent: ((inputs: Ticket_Timeline_Email_SentInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Timeline_Email_SentInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Timeline_Email_SentInputs = {
    subject: NonNullable<unknown>;
};
