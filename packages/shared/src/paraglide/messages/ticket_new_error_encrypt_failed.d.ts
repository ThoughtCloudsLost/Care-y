/**
* | output |
* | --- |
* | "Could not encrypt {ticket} data. Try again." |
*
* @param {Ticket_New_Error_Encrypt_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_error_encrypt_failed: ((inputs: Ticket_New_Error_Encrypt_FailedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_New_Error_Encrypt_FailedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_New_Error_Encrypt_FailedInputs = {
    ticket: NonNullable<unknown>;
};
