/**
* | output |
* | --- |
* | "No email address on file for this {client}." |
*
* @param {Ticket_Email_Error_No_EmailInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_email_error_no_email: ((inputs: Ticket_Email_Error_No_EmailInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Email_Error_No_EmailInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Email_Error_No_EmailInputs = {
    client: NonNullable<unknown>;
};
