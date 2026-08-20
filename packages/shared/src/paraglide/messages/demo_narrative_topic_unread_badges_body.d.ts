/**
* | output |
* | --- |
* | "Each ticket in the list shows an unread count when it has messages the volunteer has not yet read. The count reflects new messages since the volunteer last v..." |
*
* @param {Demo_Narrative_Topic_Unread_Badges_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_unread_badges_body: ((inputs?: Demo_Narrative_Topic_Unread_Badges_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Unread_Badges_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Unread_Badges_BodyInputs = {};
