/**
* | output |
* | --- |
* | "Request timed out. Try again." |
*
* @param {Twofa_Error_AbortInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_error_abort: ((inputs?: Twofa_Error_AbortInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Error_AbortInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Error_AbortInputs = {};
