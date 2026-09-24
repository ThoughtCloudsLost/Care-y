/**
* | output |
* | --- |
* | "The search sheet shows recent searches and strips of recently viewed tickets and articles. **Result groups.** Results group by type, and the group matching t..." |
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
