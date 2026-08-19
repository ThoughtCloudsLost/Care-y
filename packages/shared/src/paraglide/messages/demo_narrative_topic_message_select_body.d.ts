/**
* | output |
* | --- |
* | "The select button in the toolbar switches the thread into selection mode. Tapping messages adds them to the selection, and a select all option grabs the enti..." |
*
* @param {Demo_Narrative_Topic_Message_Select_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_message_select_body: ((inputs?: Demo_Narrative_Topic_Message_Select_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Message_Select_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Message_Select_BodyInputs = {};
