/**
* | output |
* | --- |
* | "Disbursed {amount}" |
*
* @param {Fund_Note_HeadlineInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_note_headline: ((inputs: Fund_Note_HeadlineInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Note_HeadlineInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Note_HeadlineInputs = {
    amount: NonNullable<unknown>;
};
