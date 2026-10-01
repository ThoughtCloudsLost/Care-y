/**
* | output |
* | --- |
* | "The fund balance changed. Try again." |
*
* @param {Error_Fund_Balance_StaleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_fund_balance_stale: ((inputs?: Error_Fund_Balance_StaleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Fund_Balance_StaleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Fund_Balance_StaleInputs = {};
