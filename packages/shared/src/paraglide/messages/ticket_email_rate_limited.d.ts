/**
* | output |
* | --- |
* | "Too many messages. Try again in {seconds} seconds." |
*
* @param {Ticket_Email_Rate_LimitedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_email_rate_limited: ((inputs: Ticket_Email_Rate_LimitedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Email_Rate_LimitedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Email_Rate_LimitedInputs = {
    seconds: NonNullable<unknown>;
};
