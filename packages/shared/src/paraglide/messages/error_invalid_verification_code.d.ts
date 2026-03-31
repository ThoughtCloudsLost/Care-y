/**
* | output |
* | --- |
* | "Invalid or expired verification code." |
*
* @param {Error_Invalid_Verification_CodeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_invalid_verification_code: ((inputs?: Error_Invalid_Verification_CodeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Invalid_Verification_CodeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Invalid_Verification_CodeInputs = {};
