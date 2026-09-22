/**
* | output |
* | --- |
* | "On a wide enough window the list keeps a ticket open alongside it, so choosing another ticket replaces the open one and never the list. [[#client-data]] **Wh..." |
*
* @param {Demo_Narrative_Topic_Split_View_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_split_view_body: ((inputs?: Demo_Narrative_Topic_Split_View_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Split_View_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Split_View_BodyInputs = {};
