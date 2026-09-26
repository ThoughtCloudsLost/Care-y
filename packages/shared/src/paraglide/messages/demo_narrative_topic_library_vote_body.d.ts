/**
* | output |
* | --- |
* | "Any account with the View knowledge base permission can mark an article as helpful or unhelpful, change that mark, or remove it. Each account gets one vote p..." |
*
* @param {Demo_Narrative_Topic_Library_Vote_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_vote_body: ((inputs?: Demo_Narrative_Topic_Library_Vote_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Library_Vote_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Library_Vote_BodyInputs = {};
