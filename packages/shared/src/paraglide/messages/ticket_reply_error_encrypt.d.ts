/**
* | output |
* | --- |
* | "Could not encrypt reply. Try again." |
*
* @param {Ticket_Reply_Error_EncryptInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_error_encrypt: ((inputs?: Ticket_Reply_Error_EncryptInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Reply_Error_EncryptInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Reply_Error_EncryptInputs = {};
