/**
* | output |
* | --- |
* | "Quick actions are the common operations on a ticket, run without opening it. Rows in the ticket list carry them as a swipe gesture and cards carry them as bu..." |
*
* @param {Demo_Narrative_Topic_Quick_Actions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_quick_actions_body: ((inputs?: Demo_Narrative_Topic_Quick_Actions_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Quick_Actions_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Quick_Actions_BodyInputs = {};
