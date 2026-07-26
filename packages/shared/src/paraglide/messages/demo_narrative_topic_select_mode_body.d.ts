/**
* | output |
* | --- |
* | "Select multiple tickets or messages to perform batch actions. Selection state is purely local. The server never learns which items you selected or why." |
*
* @param {Demo_Narrative_Topic_Select_Mode_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_select_mode_body: ((inputs?: Demo_Narrative_Topic_Select_Mode_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Select_Mode_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Select_Mode_BodyInputs = {};
