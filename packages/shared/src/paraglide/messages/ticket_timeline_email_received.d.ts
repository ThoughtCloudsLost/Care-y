/**
* | output |
* | --- |
* | "Email received: {subject}" |
*
* @param {Ticket_Timeline_Email_ReceivedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_email_received: ((inputs: Ticket_Timeline_Email_ReceivedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Timeline_Email_ReceivedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Timeline_Email_ReceivedInputs = {
    subject: NonNullable<unknown>;
};
