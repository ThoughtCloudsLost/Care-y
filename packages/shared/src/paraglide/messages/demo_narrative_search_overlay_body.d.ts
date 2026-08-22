/**
* | output |
* | --- |
* | "The magnifier in the navigation bar opens the global search field, and results appear in a sheet below as you type. **Before typing.** The sheet shows recent..." |
*
* @param {Demo_Narrative_Search_Overlay_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_overlay_body: ((inputs?: Demo_Narrative_Search_Overlay_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Search_Overlay_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Search_Overlay_BodyInputs = {};
