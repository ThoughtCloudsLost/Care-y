/**
* | output |
* | --- |
* | "This means search results are as private as the tickets themselves. The server cannot log what you searched for or which results matched." |
*
* @param {Demo_Narrative_Search_Body2Inputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_body2: ((inputs?: Demo_Narrative_Search_Body2Inputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Search_Body2Inputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Search_Body2Inputs = {};
