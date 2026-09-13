/**
* | output |
* | --- |
* | "Email was delivered, but saving it to the thread failed. Tap to retry saving." |
*
* @param {Ticket_Email_Error_RecordInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_email_error_record: ((inputs?: Ticket_Email_Error_RecordInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Email_Error_RecordInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Email_Error_RecordInputs = {};
