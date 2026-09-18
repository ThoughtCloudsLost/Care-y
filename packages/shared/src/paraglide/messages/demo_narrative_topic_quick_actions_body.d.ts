/**
* | output |
* | --- |
* | "Common operations on a ticket without opening it, accessed by swiping a ticket row. **Swipe directions.** Swipe right to reply. Swipe left to assign or place..." |
*
* @param {Demo_Narrative_Topic_Quick_Actions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_quick_actions_body: ((inputs?: Demo_Narrative_Topic_Quick_Actions_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Quick_Actions_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Quick_Actions_BodyInputs = {};
