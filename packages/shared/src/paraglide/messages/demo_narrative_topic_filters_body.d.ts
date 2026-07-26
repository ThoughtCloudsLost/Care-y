/**
* | output |
* | --- |
* | "Filter by status, queue, priority, assignee, or date range. The server evaluates filters against encrypted metadata indexes. It returns matching rows without..." |
*
* @param {Demo_Narrative_Topic_Filters_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_filters_body: ((inputs?: Demo_Narrative_Topic_Filters_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Filters_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Filters_BodyInputs = {};
