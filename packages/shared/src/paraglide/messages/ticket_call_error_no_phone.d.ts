/**
* | output |
* | --- |
* | "No phone number on file for this {client}." |
*
* @param {Ticket_Call_Error_No_PhoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_call_error_no_phone: ((inputs: Ticket_Call_Error_No_PhoneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Call_Error_No_PhoneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Call_Error_No_PhoneInputs = {
    client: NonNullable<unknown>;
};
