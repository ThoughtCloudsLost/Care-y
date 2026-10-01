/**
* | output |
* | --- |
* | "Adjustment" |
*
* @param {Fund_Entry_AdjustmentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_entry_adjustment: ((inputs?: Fund_Entry_AdjustmentInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Entry_AdjustmentInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Entry_AdjustmentInputs = {};
