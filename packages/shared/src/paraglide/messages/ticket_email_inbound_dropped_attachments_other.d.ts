/**
* | output |
* | --- |
* | "{count} attachments were dropped" |
*
* @param {Ticket_Email_Inbound_Dropped_Attachments_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_email_inbound_dropped_attachments_other: ((inputs: Ticket_Email_Inbound_Dropped_Attachments_OtherInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Email_Inbound_Dropped_Attachments_OtherInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Email_Inbound_Dropped_Attachments_OtherInputs = {
    count: NonNullable<unknown>;
};
