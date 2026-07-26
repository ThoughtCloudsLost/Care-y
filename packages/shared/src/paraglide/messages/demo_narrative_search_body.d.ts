/**
* | output |
* | --- |
* | "Search works entirely in the browser. Your device decrypts ticket content locally and matches your query against the plaintext. No search terms are ever sent..." |
*
* @param {Demo_Narrative_Search_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_body: ((inputs?: Demo_Narrative_Search_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Search_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Search_BodyInputs = {};
