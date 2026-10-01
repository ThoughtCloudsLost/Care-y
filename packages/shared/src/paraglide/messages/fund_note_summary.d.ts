/**
* | output |
* | --- |
* | "Disbursement: {amount}" |
*
* @param {Fund_Note_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_note_summary: ((inputs: Fund_Note_SummaryInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Note_SummaryInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Note_SummaryInputs = {
    amount: NonNullable<unknown>;
};
