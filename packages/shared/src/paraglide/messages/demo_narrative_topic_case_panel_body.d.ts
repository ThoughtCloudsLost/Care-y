/**
* | output |
* | --- |
* | "The case panel holds the contact rows, the client's channel, the notes and media collected on the case, and the actions that change it: editing the case, ass..." |
*
* @param {Demo_Narrative_Topic_Case_Panel_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_case_panel_body: ((inputs?: Demo_Narrative_Topic_Case_Panel_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Case_Panel_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Case_Panel_BodyInputs = {};
