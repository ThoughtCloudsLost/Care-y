/**
* | output |
* | --- |
* | "Too many messages. Try again in {seconds} seconds." |
*
* @param {Ticket_Sms_Rate_LimitedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_sms_rate_limited: ((inputs: Ticket_Sms_Rate_LimitedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Sms_Rate_LimitedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Sms_Rate_LimitedInputs = {
    seconds: NonNullable<unknown>;
};
