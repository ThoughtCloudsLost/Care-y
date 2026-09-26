/**
* | output |
* | --- |
* | "Searching inside a ticket matches against the text already decrypted in the browser. No search term is sent to the server, no result is reported back, and th..." |
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
