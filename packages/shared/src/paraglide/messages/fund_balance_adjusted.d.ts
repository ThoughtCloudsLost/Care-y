/**
* | output |
* | --- |
* | "Adjusted" |
*
* @param {Fund_Balance_AdjustedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_balance_adjusted: ((inputs?: Fund_Balance_AdjustedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Balance_AdjustedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Balance_AdjustedInputs = {};
