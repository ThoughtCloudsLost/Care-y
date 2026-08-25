/**
* | output |
* | --- |
* | "Assignments, status changes, priority changes, holds, and merges are recorded in the thread as compact entries between messages, so the case history and the ..." |
*
* @param {Demo_Narrative_Topic_System_Events_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_system_events_body: ((inputs?: Demo_Narrative_Topic_System_Events_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_System_Events_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_System_Events_BodyInputs = {};
