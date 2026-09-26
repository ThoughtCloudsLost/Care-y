/**
* | output |
* | --- |
* | "Assignments, status changes, priority moves, queue moves, holds, and merges each appear in the conversation thread as a follow-up. The record of what was don..." |
*
* @param {Demo_Narrative_Topic_System_Events_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_system_events_body: ((inputs?: Demo_Narrative_Topic_System_Events_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_System_Events_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_System_Events_BodyInputs = {};
