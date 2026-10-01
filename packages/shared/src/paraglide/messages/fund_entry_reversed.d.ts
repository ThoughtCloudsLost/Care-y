/**
* | output |
* | --- |
* | "Corrected" |
*
* @param {Fund_Entry_ReversedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_entry_reversed: ((inputs?: Fund_Entry_ReversedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Entry_ReversedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Entry_ReversedInputs = {};
