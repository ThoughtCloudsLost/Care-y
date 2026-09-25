/**
* | output |
* | --- |
* | "The ticket list has four view modes: table, compact rows, cards, and grid. [[#client-data]] **What each mode requests.** Compact rows request no message prev..." |
*
* @param {Demo_Narrative_Topic_View_Modes_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_view_modes_body: ((inputs?: Demo_Narrative_Topic_View_Modes_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_View_Modes_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_View_Modes_BodyInputs = {};
