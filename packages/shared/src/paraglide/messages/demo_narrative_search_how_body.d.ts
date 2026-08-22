/**
* | output |
* | --- |
* | "Global search runs in two tiers. **Instant results.** When you type, the browser fuzzy matches your query against content it has already decrypted and cached..." |
*
* @param {Demo_Narrative_Search_How_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_how_body: ((inputs?: Demo_Narrative_Search_How_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Search_How_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Search_How_BodyInputs = {};
