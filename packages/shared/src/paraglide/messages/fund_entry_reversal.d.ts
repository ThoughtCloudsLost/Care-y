/**
* | output |
* | --- |
* | "Correction" |
*
* @param {Fund_Entry_ReversalInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_entry_reversal: ((inputs?: Fund_Entry_ReversalInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Entry_ReversalInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Entry_ReversalInputs = {};
