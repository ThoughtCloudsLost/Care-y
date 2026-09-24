/**
* | output |
* | --- |
* | "Email is not enabled for this organization." |
*
* @param {Error_Email_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_email_disabled: ((inputs?: Error_Email_DisabledInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Email_DisabledInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Email_DisabledInputs = {};
