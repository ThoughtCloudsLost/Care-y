/**
* | output |
* | --- |
* | "Recorded by {name}" |
*
* @param {Fund_Entry_ByInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_entry_by: ((inputs: Fund_Entry_ByInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Entry_ByInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Entry_ByInputs = {
    name: NonNullable<unknown>;
};
