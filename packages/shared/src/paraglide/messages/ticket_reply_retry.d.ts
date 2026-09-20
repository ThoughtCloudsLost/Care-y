/**
* | output |
* | --- |
* | "Retry" |
*
* @param {Ticket_Reply_RetryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_retry: ((inputs?: Ticket_Reply_RetryInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Reply_RetryInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Reply_RetryInputs = {};
