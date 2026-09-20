/**
* | output |
* | --- |
* | "Selection mode allows picking messages from the thread individually or all at once. **Copy.** The selection bar copies the decrypted text of every selected m..." |
*
* @param {Demo_Narrative_Topic_Message_Select_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_message_select_body: ((inputs?: Demo_Narrative_Topic_Message_Select_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Message_Select_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Message_Select_BodyInputs = {};
