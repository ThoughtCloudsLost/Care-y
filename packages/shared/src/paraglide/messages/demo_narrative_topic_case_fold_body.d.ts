/**
* | output |
* | --- |
* | "The case fields below the header can be folded away. The title, status, and priority stay visible in the header above. **Encryption.** The description is enc..." |
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
