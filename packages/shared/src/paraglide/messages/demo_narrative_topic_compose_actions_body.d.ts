/**
* | output |
* | --- |
* | "The compose bar at the bottom of the screen is where volunteers write replies and notes. **Mode switching.** The compose bar can switch between reply mode an..." |
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
