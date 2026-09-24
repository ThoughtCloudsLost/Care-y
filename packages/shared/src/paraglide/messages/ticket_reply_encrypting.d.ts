/**
* | output |
* | --- |
* | "Encrypting..." |
*
* @param {Ticket_Reply_EncryptingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_encrypting: ((inputs?: Ticket_Reply_EncryptingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Reply_EncryptingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Reply_EncryptingInputs = {};
