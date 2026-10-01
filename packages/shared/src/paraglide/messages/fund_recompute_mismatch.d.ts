/**
* | output |
* | --- |
* | "The stored balance does not match the ledger, which adds up to {amount}." |
*
* @param {Fund_Recompute_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_recompute_mismatch: ((inputs: Fund_Recompute_MismatchInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Recompute_MismatchInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Recompute_MismatchInputs = {
    amount: NonNullable<unknown>;
};
