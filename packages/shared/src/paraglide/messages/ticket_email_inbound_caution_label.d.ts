/**
* | output |
* | --- |
* | "Email caution" |
*
* @param {Ticket_Email_Inbound_Caution_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_email_inbound_caution_label: ((inputs?: Ticket_Email_Inbound_Caution_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Email_Inbound_Caution_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Email_Inbound_Caution_LabelInputs = {};
