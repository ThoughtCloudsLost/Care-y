/**
* | output |
* | --- |
* | "The ticket list supports five layout options. - **Table** presents tickets in a sortable data table with columns for each field - **Rows** show compact singl..." |
*
* @param {Demo_Narrative_Topic_View_Modes_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_view_modes_body: ((inputs?: Demo_Narrative_Topic_View_Modes_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_View_Modes_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_View_Modes_BodyInputs = {};
