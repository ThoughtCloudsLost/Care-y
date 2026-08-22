/**
* | output |
* | --- |
* | "The row under the page title shows live counts for new, active, and on hold tickets, as well as a new replies count once the browser finishes checking read s..." |
*
* @param {Demo_Narrative_Topic_List_Stats_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_list_stats_body: ((inputs?: Demo_Narrative_Topic_List_Stats_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_List_Stats_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_List_Stats_BodyInputs = {};
