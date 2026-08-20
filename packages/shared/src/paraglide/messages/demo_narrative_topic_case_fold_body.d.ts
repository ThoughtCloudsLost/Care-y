/**
* | output |
* | --- |
* | "The disclosure handle under the ticket header folds the case fields away to give the conversation more room and brings them back when needed. **What folds.**..." |
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
