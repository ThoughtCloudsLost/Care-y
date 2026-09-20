/**
* | output |
* | --- |
* | "Email conflict" |
*
* @param {Client_Email_Conflict_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_email_conflict_title: ((inputs?: Client_Email_Conflict_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Email_Conflict_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Email_Conflict_TitleInputs = {};
