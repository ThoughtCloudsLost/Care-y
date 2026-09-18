/**
* | output |
* | --- |
* | "The case panel holds the full case record and every case level action. It opens from the client alias or the case button in the navigation bar. **Phone numbe..." |
*
* @param {Demo_Narrative_Topic_Case_Panel_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_case_panel_body: ((inputs?: Demo_Narrative_Topic_Case_Panel_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Case_Panel_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Case_Panel_BodyInputs = {};
