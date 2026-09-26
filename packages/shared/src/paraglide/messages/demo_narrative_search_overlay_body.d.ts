/**
* | output |
* | --- |
* | "Global search opens as an overlay and shows recent searches and recently viewed cases and articles before the account enters a search term. Results appear af..." |
*
* @param {Demo_Narrative_Search_Overlay_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_overlay_body: ((inputs?: Demo_Narrative_Search_Overlay_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Search_Overlay_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Search_Overlay_BodyInputs = {};
