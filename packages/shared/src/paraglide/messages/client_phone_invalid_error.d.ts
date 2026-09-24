/**
* | output |
* | --- |
* | "Enter a number like +1 555 000 1234" |
*
* @param {Client_Phone_Invalid_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_phone_invalid_error: ((inputs?: Client_Phone_Invalid_ErrorInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Phone_Invalid_ErrorInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Phone_Invalid_ErrorInputs = {};
