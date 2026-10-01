/**
* | output |
* | --- |
* | "{amount} available" |
*
* @param {Fund_Available_AmountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_available_amount: ((inputs: Fund_Available_AmountInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Available_AmountInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Available_AmountInputs = {
    amount: NonNullable<unknown>;
};
