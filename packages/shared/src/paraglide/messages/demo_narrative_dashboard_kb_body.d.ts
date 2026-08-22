/**
* | output |
* | --- |
* | "A preview of recently updated knowledge base articles on the overview page. Tapping an article navigates to the full article in the library. **Encryption.** ..." |
*
* @param {Demo_Narrative_Dashboard_Kb_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_kb_body: ((inputs?: Demo_Narrative_Dashboard_Kb_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_Kb_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_Kb_BodyInputs = {};
