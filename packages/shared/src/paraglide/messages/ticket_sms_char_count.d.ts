/**
* | output |
* | --- |
* | "{count} / 1600" |
*
* @param {Ticket_Sms_Char_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_sms_char_count: ((inputs: Ticket_Sms_Char_CountInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Sms_Char_CountInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Sms_Char_CountInputs = {
    count: NonNullable<unknown>;
};
