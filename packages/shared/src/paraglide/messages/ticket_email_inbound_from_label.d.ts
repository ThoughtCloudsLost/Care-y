/**
* | output |
* | --- |
* | "From: {from} (unverified)" |
*
* @param {Ticket_Email_Inbound_From_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_email_inbound_from_label: ((inputs: Ticket_Email_Inbound_From_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Email_Inbound_From_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Email_Inbound_From_LabelInputs = {
    from: NonNullable<unknown>;
};
