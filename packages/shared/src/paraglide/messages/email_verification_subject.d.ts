/**
* | output |
* | --- |
* | "Your verification code" |
*
* @param {Email_Verification_SubjectInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const email_verification_subject: ((inputs?: Email_Verification_SubjectInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Email_Verification_SubjectInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Email_Verification_SubjectInputs = {};
