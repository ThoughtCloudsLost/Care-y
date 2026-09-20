/**
* | output |
* | --- |
* | "Volunteers can search within a single ticket's conversation for specific words or phrases. The search runs entirely in the browser against the decrypted mess..." |
*
* @param {Demo_Narrative_Topic_Deep_Search_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_deep_search_body: ((inputs?: Demo_Narrative_Topic_Deep_Search_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Deep_Search_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Deep_Search_BodyInputs = {};
