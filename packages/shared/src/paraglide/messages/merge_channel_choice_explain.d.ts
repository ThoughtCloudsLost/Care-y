/**
* | output |
* | --- |
* | "Only one link can stay active after the merge. The other link will stop working." |
*
* @param {Merge_Channel_Choice_ExplainInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const merge_channel_choice_explain: ((inputs?: Merge_Channel_Choice_ExplainInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Merge_Channel_Choice_ExplainInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Merge_Channel_Choice_ExplainInputs = {};
