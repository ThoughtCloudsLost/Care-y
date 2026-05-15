/**
* | output |
* | --- |
* | "Resend code" |
*
* @param {Twofa_Email_ResendInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_email_resend: ((inputs?: Twofa_Email_ResendInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Email_ResendInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Email_ResendInputs = {};
