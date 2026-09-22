/**
* | output |
* | --- |
* | "The counts report how many tickets are new, active and on hold across every queue the user has access to, and how many carry replies the user has not read. [..." |
*
* @param {Demo_Narrative_Topic_List_Stats_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_list_stats_body: ((inputs?: Demo_Narrative_Topic_List_Stats_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_List_Stats_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_List_Stats_BodyInputs = {};
