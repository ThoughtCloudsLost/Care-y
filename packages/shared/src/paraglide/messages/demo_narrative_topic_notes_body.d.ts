/**
* | output |
* | --- |
* | "An internal note records what the organization wants remembered about a case without sending anything to the client, and it is sealed with the same case key ..." |
*
* @param {Demo_Narrative_Topic_Notes_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_notes_body: ((inputs?: Demo_Narrative_Topic_Notes_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Notes_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Notes_BodyInputs = {};
