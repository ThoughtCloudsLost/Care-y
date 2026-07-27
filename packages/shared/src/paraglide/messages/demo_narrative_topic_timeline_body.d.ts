/**
* | output |
* | --- |
* | "The detail subnavbar includes a chat/timeline toggle. Timeline view replaces the message thread with a structured table of contents. It shows status changes,..." |
*
* @param {Demo_Narrative_Topic_Timeline_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_timeline_body: ((inputs?: Demo_Narrative_Topic_Timeline_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Timeline_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Timeline_BodyInputs = {};
