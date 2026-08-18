/**
* | output |
* | --- |
* | "Quick actions let volunteers perform common operations on a ticket without opening it. Swipe a ticket row to access them. **Swipe directions.** Swipe right t..." |
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
