/**
* | output |
* | --- |
* | "{amount} available, below zero" |
*
* @param {Fund_Available_Below_ZeroInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_available_below_zero: ((inputs: Fund_Available_Below_ZeroInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Available_Below_ZeroInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Available_Below_ZeroInputs = {
    amount: NonNullable<unknown>;
};
