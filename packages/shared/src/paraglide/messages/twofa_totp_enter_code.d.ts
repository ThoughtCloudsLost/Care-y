/**
* | output |
* | --- |
* | "Enter the 6-digit code" |
*
* @param {Twofa_Totp_Enter_CodeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_totp_enter_code: ((inputs?: Twofa_Totp_Enter_CodeInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Totp_Enter_CodeInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Totp_Enter_CodeInputs = {};
