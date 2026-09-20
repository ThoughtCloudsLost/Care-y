/**
* | output |
* | --- |
* | "Send verification code" |
*
* @param {Twofa_Email_Send_CodeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_email_send_code: ((inputs?: Twofa_Email_Send_CodeInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Email_Send_CodeInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Email_Send_CodeInputs = {};
