/**
* | output |
* | --- |
* | "Select mode turns the list into a pick-several surface so one action applies to every ticket chosen, and a long press on a row both enters the mode and picks..." |
*
* @param {Demo_Narrative_Topic_Select_Mode_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_select_mode_body: ((inputs?: Demo_Narrative_Topic_Select_Mode_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Select_Mode_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Select_Mode_BodyInputs = {};
