/**
* | output |
* | --- |
* | "Enter a valid email address" |
*
* @param {Client_Email_Invalid_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_email_invalid_error: ((inputs?: Client_Email_Invalid_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Email_Invalid_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Email_Invalid_ErrorInputs = {};
