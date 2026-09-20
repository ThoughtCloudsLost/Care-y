/**
* | output |
* | --- |
* | "The detail view includes a toggle between the conversation thread and a timeline view. The timeline replaces the message thread with a structured chronologic..." |
*
* @param {Demo_Narrative_Topic_Timeline_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_timeline_body: ((inputs?: Demo_Narrative_Topic_Timeline_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Timeline_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Timeline_BodyInputs = {};
