/**
* | output |
* | --- |
* | "Enter an amount above zero, with up to two decimals." |
*
* @param {Fund_Amount_InvalidInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_amount_invalid: ((inputs?: Fund_Amount_InvalidInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Amount_InvalidInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Amount_InvalidInputs = {};
