/**
* | output |
* | --- |
* | "Retry" |
*
* @param {Ticket_Reply_RetryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_retry: ((inputs?: Ticket_Reply_RetryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Reply_RetryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Reply_RetryInputs = {};
