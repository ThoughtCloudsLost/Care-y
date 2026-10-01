/**
* | output |
* | --- |
* | "Disbursed {amount} from {fund}" |
*
* @param {Fund_Note_Headline_FundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_note_headline_fund: ((inputs: Fund_Note_Headline_FundInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Note_Headline_FundInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Note_Headline_FundInputs = {
    amount: NonNullable<unknown>;
    fund: NonNullable<unknown>;
};
