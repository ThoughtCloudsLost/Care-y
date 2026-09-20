/**
* | output |
* | --- |
* | "Volunteers can rate whether a knowledge base article helped resolve a call. Each volunteer gets one vote per article (up or down). **Ranking.** The aggregate..." |
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
