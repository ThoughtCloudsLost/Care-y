/**
* | output |
* | --- |
* | "Volunteers can edit an outbound in-app message after sending it by opening the message's action menu and selecting edit. The edit sheet opens with the decryp..." |
*
* @param {Demo_Narrative_Topic_Outbound_Edit_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_outbound_edit_body: ((inputs?: Demo_Narrative_Topic_Outbound_Edit_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Outbound_Edit_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Outbound_Edit_BodyInputs = {};
