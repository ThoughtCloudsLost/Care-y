/**
* | output |
* | --- |
* | "Confirm email change" |
*
* @param {Client_Email_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_email_confirm_title: ((inputs?: Client_Email_Confirm_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Email_Confirm_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Email_Confirm_TitleInputs = {};
