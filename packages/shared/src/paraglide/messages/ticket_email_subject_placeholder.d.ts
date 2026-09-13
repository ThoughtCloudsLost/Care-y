/**
* | output |
* | --- |
* | "Subject" |
*
* @param {Ticket_Email_Subject_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_email_subject_placeholder: ((inputs?: Ticket_Email_Subject_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Email_Subject_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Email_Subject_PlaceholderInputs = {};
