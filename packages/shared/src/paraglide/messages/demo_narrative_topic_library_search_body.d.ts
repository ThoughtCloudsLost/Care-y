/**
* | output |
* | --- |
* | "The library has its own search bar that finds articles by fuzzy matching against decrypted titles and excerpts. **Full search.** If no matches are found amon..." |
*
* @param {Demo_Narrative_Topic_Library_Search_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_search_body: ((inputs?: Demo_Narrative_Topic_Library_Search_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Library_Search_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Library_Search_BodyInputs = {};
