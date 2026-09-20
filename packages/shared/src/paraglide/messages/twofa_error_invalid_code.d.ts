/**
* | output |
* | --- |
* | "Invalid code. Try again." |
*
* @param {Twofa_Error_Invalid_CodeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_error_invalid_code: ((inputs?: Twofa_Error_Invalid_CodeInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Error_Invalid_CodeInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Error_Invalid_CodeInputs = {};
