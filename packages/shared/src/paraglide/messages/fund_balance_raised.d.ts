/**
* | output |
* | --- |
* | "Raised" |
*
* @param {Fund_Balance_RaisedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_balance_raised: ((inputs?: Fund_Balance_RaisedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Balance_RaisedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Balance_RaisedInputs = {};
