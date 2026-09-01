/**
* | output |
* | --- |
* | "Email" |
*
* @param {Client_Email_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_email_label: ((inputs?: Client_Email_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Email_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Email_LabelInputs = {};
