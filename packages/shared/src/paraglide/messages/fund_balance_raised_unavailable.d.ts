/**
* | output |
* | --- |
* | "Raised total unavailable" |
*
* @param {Fund_Balance_Raised_UnavailableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_balance_raised_unavailable: ((inputs?: Fund_Balance_Raised_UnavailableInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Balance_Raised_UnavailableInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Balance_Raised_UnavailableInputs = {};
