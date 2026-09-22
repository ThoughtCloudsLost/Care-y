/**
* | output |
* | --- |
* | "Searching the library matches a term against the titles and excerpts already decrypted in the browser, using the same fuzzy matcher the overlay uses, and ord..." |
*
* @param {Demo_Narrative_Topic_Library_Search_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_search_body: ((inputs?: Demo_Narrative_Topic_Library_Search_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Library_Search_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Library_Search_BodyInputs = {};
