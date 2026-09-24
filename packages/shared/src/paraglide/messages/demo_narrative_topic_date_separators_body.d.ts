/**
* | output |
* | --- |
* | "A dateline marks each change of day in the thread, and a line marks where reading stopped last time. [[#client-data]] **Where the day boundary comes from.** ..." |
*
* @param {Demo_Narrative_Topic_Date_Separators_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_date_separators_body: ((inputs?: Demo_Narrative_Topic_Date_Separators_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Date_Separators_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Date_Separators_BodyInputs = {};
