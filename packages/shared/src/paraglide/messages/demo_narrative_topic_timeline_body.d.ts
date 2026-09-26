/**
* | output |
* | --- |
* | "The timeline indexes a ticket's follow-ups by date. Notes, recorded events, and calls appear individually with their content. Ordinary messages are collapsed..." |
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
