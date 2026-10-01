/**
* | output |
* | --- |
* | "In {currency}, up to two decimals." |
*
* @param {Fund_Amount_Currency_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_amount_currency_hint: ((inputs: Fund_Amount_Currency_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Amount_Currency_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Amount_Currency_HintInputs = {
    currency: NonNullable<unknown>;
};
