/**
* | output |
* | --- |
* | "Subject: {subject}" |
*
* @param {Ticket_Email_Subject_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_email_subject_label: ((inputs: Ticket_Email_Subject_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Email_Subject_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Email_Subject_LabelInputs = {
    subject: NonNullable<unknown>;
};
