/**
* | output |
* | --- |
* | "Email received" |
*
* @param {Ticket_Timeline_Email_Received_PlainInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_email_received_plain: ((inputs?: Ticket_Timeline_Email_Received_PlainInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Timeline_Email_Received_PlainInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Timeline_Email_Received_PlainInputs = {};
