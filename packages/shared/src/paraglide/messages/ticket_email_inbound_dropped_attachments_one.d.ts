/**
* | output |
* | --- |
* | "{count} attachment was dropped" |
*
* @param {Ticket_Email_Inbound_Dropped_Attachments_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_email_inbound_dropped_attachments_one: ((inputs: Ticket_Email_Inbound_Dropped_Attachments_OneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Email_Inbound_Dropped_Attachments_OneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Email_Inbound_Dropped_Attachments_OneInputs = {
    count: NonNullable<unknown>;
};
