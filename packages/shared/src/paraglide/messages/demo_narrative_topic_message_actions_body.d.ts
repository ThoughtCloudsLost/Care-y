/**
* | output |
* | --- |
* | "Tapping and holding a message opens a context menu with actions for that specific message. **Available actions.** Three actions are available: copy, edit, an..." |
*
* @param {Demo_Narrative_Topic_Message_Actions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_message_actions_body: ((inputs?: Demo_Narrative_Topic_Message_Actions_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Message_Actions_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Message_Actions_BodyInputs = {};
