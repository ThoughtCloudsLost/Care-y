/**
* | output |
* | --- |
* | "No email address on file for this {client}." |
*
* @param {Ticket_Email_Error_No_EmailInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_email_error_no_email: ((inputs: Ticket_Email_Error_No_EmailInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Email_Error_No_EmailInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Email_Error_No_EmailInputs = {
    client: NonNullable<unknown>;
};
