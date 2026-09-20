/**
* | output |
* | --- |
* | "Text {Client}" |
*
* @param {Ticket_Sms_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_sms_title: ((inputs: Ticket_Sms_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Sms_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Sms_TitleInputs = {
    Client: NonNullable<unknown>;
    client: NonNullable<unknown>;
};
