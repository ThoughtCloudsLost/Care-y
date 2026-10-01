/**
* | output |
* | --- |
* | "Disbursement" |
*
* @param {Fund_Entry_DisbursementInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_entry_disbursement: ((inputs?: Fund_Entry_DisbursementInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Fund_Entry_DisbursementInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Fund_Entry_DisbursementInputs = {};
