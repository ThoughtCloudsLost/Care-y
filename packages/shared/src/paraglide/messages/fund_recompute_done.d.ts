/**
* | output |
* | --- |
* | "Balance recomputed from the ledger" |
*
* @param {Fund_Recompute_DoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_recompute_done: ((inputs?: Fund_Recompute_DoneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Recompute_DoneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Recompute_DoneInputs = {};
