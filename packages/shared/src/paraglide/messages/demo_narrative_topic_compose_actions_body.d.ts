/**
* | output |
* | --- |
* | "The compose menu lists the available actions for a ticket. The entries that appear depend on the client's contact methods and the volunteer's permissions. **..." |
*
* @param {Demo_Narrative_Topic_Compose_Actions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_compose_actions_body: ((inputs?: Demo_Narrative_Topic_Compose_Actions_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Compose_Actions_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Compose_Actions_BodyInputs = {};
