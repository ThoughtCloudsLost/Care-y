/**
* | output |
* | --- |
* | "Write your message..." |
*
* @param {Ticket_Email_Body_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_email_body_placeholder: ((inputs?: Ticket_Email_Body_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Email_Body_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Email_Body_PlaceholderInputs = {};
