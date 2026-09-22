/**
* | output |
* | --- |
* | "The list can be sorted by creation date, last edit or rating, narrowed by category, rating band, author and a creation date range, and presented in four ways..." |
*
* @param {Demo_Narrative_Topic_Library_Tools_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_tools_body: ((inputs?: Demo_Narrative_Topic_Library_Tools_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Library_Tools_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Library_Tools_BodyInputs = {};
