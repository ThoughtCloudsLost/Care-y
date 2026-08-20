/**
* | output |
* | --- |
* | "On wider screens, the ticket list supports a split view where the list and a ticket detail pane sit side by side. Selecting a ticket from the list opens its ..." |
*
* @param {Demo_Narrative_Topic_Split_View_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_split_view_body: ((inputs?: Demo_Narrative_Topic_Split_View_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Split_View_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Split_View_BodyInputs = {};
