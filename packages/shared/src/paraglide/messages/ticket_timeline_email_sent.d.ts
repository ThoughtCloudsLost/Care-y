/**
* | output |
* | --- |
* | "Email sent: {subject}" |
*
* @param {Ticket_Timeline_Email_SentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_email_sent: ((inputs: Ticket_Timeline_Email_SentInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Timeline_Email_SentInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Timeline_Email_SentInputs = {
    subject: NonNullable<unknown>;
};
