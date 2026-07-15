/**
* | output |
* | --- |
* | "texting {client} via SMS" |
*
* @param {Ticket_Mode_Indicator_SmsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_mode_indicator_sms: ((inputs: Ticket_Mode_Indicator_SmsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Mode_Indicator_SmsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Mode_Indicator_SmsInputs = {
    client: NonNullable<unknown>;
};
