/**
* | output |
* | --- |
* | "The compose menu offers the ways of adding something to a case: a reply on the client's encrypted channel, a text, an email, a file, a saved response, or an ..." |
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
