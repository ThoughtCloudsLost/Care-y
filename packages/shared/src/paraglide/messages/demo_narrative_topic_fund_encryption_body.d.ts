/**
* | output |
* | --- |
* | "Fund names, amounts, currency codes, entry types, and who recorded each entry are inside encrypted payloads that the server stores and cannot open. The serve..." |
*
* @param {Demo_Narrative_Topic_Fund_Encryption_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_fund_encryption_body: ((inputs?: Demo_Narrative_Topic_Fund_Encryption_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Fund_Encryption_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Fund_Encryption_BodyInputs = {};
