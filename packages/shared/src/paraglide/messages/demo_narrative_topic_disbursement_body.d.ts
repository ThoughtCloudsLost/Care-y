/**
* | output |
* | --- |
* | "Recording a disbursement is a compose action alongside the internal note, offered when the case's queue carries a fund and the user holds the Record disburse..." |
*
* @param {Demo_Narrative_Topic_Disbursement_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_disbursement_body: ((inputs?: Demo_Narrative_Topic_Disbursement_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Disbursement_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Disbursement_BodyInputs = {};
