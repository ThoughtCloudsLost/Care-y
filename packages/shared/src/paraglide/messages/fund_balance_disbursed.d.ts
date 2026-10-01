/**
* | output |
* | --- |
* | "Disbursed" |
*
* @param {Fund_Balance_DisbursedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_balance_disbursed: ((inputs?: Fund_Balance_DisbursedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Balance_DisbursedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Balance_DisbursedInputs = {};
