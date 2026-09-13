/**
* | output |
* | --- |
* | "{count} attachments were dropped" |
*
* @param {Ticket_Email_Inbound_Dropped_Attachments_OtherInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_email_inbound_dropped_attachments_other: ((inputs: Ticket_Email_Inbound_Dropped_Attachments_OtherInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Email_Inbound_Dropped_Attachments_OtherInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Email_Inbound_Dropped_Attachments_OtherInputs = {
    count: NonNullable<unknown>;
};
