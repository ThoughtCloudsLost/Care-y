/**
* | output |
* | --- |
* | "Enter a number like +1 555 000 1234" |
*
* @param {Client_Phone_Invalid_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_phone_invalid_error: ((inputs?: Client_Phone_Invalid_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Phone_Invalid_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Phone_Invalid_ErrorInputs = {};
