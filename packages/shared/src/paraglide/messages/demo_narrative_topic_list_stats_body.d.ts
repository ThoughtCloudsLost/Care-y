/**
* | output |
* | --- |
* | "The ticket list shows counts across every queue the account can access, plus a count of tickets carrying replies the account has not read. The status counts ..." |
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
