/**
* | output |
* | --- |
* | "The case details panel shows ticket metadata in a structured field list. **Encrypted fields.** Title and description are encrypted with the per ticket key. Q..." |
*
* @param {Demo_Narrative_Topic_Case_Fold_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_case_fold_body: ((inputs?: Demo_Narrative_Topic_Case_Fold_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Case_Fold_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Case_Fold_BodyInputs = {};
