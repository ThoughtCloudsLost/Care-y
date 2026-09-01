/**
* | output |
* | --- |
* | "Edit email" |
*
* @param {Client_Email_EditInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_email_edit: ((inputs?: Client_Email_EditInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Email_EditInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Email_EditInputs = {};
