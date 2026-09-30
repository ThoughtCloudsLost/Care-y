/**
* | output |
* | --- |
* | "A long press on an entry in the thread opens a menu of the actions that entry allows. Shift+F10 opens the same menu from a keyboard. An entry with nothing en..." |
*
* @param {Demo_Narrative_Topic_Message_Actions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_message_actions_body: ((inputs?: Demo_Narrative_Topic_Message_Actions_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Message_Actions_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Message_Actions_BodyInputs = {};
