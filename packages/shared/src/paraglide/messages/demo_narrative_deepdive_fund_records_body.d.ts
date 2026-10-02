/**
* | output |
* | --- |
* | "Every value that describes a fund or a ledger entry by name, amount, currency, type, or author is organization-key ciphertext. The server stores the sealed b..." |
*
* @param {Demo_Narrative_Deepdive_Fund_Records_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_fund_records_body: ((inputs?: Demo_Narrative_Deepdive_Fund_Records_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Deepdive_Fund_Records_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Deepdive_Fund_Records_BodyInputs = {};
