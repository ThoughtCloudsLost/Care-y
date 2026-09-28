/**
* | output |
* | --- |
* | "The user can correct a message already sent on the client's encrypted channel. The correction replaces both the follow-up row and the client's portal copy. [..." |
*
* @param {Demo_Narrative_Topic_Outbound_Edit_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_outbound_edit_body: ((inputs?: Demo_Narrative_Topic_Outbound_Edit_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Outbound_Edit_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Outbound_Edit_BodyInputs = {};
