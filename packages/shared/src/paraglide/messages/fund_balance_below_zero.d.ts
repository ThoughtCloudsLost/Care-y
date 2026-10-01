/**
* | output |
* | --- |
* | "Below zero" |
*
* @param {Fund_Balance_Below_ZeroInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_balance_below_zero: ((inputs?: Fund_Balance_Below_ZeroInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Balance_Below_ZeroInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Balance_Below_ZeroInputs = {};
