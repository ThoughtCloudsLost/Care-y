/**
* | output |
* | --- |
* | "Assignments, status changes, priority and queue moves, holds and merges are recorded in the thread as their own entries, so what was done to a case sits in t..." |
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
