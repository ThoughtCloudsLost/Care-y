/**
* | output |
* | --- |
* | "The case panel shows the fund mapped to the case's queue, with the fund's name and its available balance. A case in a queue with no fund mapping shows no fun..." |
*
* @param {Demo_Narrative_Topic_Fund_Balances_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_fund_balances_body: ((inputs?: Demo_Narrative_Topic_Fund_Balances_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Fund_Balances_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Fund_Balances_BodyInputs = {};
