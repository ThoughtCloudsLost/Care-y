/**
* | output |
* | --- |
* | "The compose bar is accessed via the + icon at the bottom of the screen and is where volunteers write replies to clients and internal notes to other org membe..." |
*
* @param {Demo_Narrative_Topic_Compose_Actions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_compose_actions_body: ((inputs?: Demo_Narrative_Topic_Compose_Actions_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Compose_Actions_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Compose_Actions_BodyInputs = {};
