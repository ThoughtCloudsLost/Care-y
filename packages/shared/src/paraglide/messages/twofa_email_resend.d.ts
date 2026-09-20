/**
* | output |
* | --- |
* | "Resend code" |
*
* @param {Twofa_Email_ResendInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_email_resend: ((inputs?: Twofa_Email_ResendInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Email_ResendInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Email_ResendInputs = {};
