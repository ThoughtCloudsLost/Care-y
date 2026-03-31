/**
* | output |
* | --- |
* | "<p>Your verification code is: <strong>{code}</strong></p><p>This code expires in 5 minutes. If you did not request this code, you can safely ignore this emai..." |
*
* @param {Email_Verification_HtmlInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const email_verification_html: ((inputs: Email_Verification_HtmlInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Email_Verification_HtmlInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Email_Verification_HtmlInputs = {
    code: NonNullable<unknown>;
};
