/**
* | output |
* | --- |
* | "Encrypting..." |
*
* @param {Ticket_Reply_EncryptingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_encrypting: ((inputs?: Ticket_Reply_EncryptingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Reply_EncryptingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Reply_EncryptingInputs = {};
