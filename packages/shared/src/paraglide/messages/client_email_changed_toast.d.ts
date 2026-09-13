/**
* | output |
* | --- |
* | "Email address updated" |
*
* @param {Client_Email_Changed_ToastInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_email_changed_toast: ((inputs?: Client_Email_Changed_ToastInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Email_Changed_ToastInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Email_Changed_ToastInputs = {};
