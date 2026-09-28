/**
* | output |
* | --- |
* | "Too many attempts. Wait a few minutes, then try again." |
*
* @param {Error_Twofa_Rate_LimitedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_twofa_rate_limited: ((inputs?: Error_Twofa_Rate_LimitedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Twofa_Rate_LimitedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Twofa_Rate_LimitedInputs = {};
