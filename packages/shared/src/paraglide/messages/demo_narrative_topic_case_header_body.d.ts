/**
* | output |
* | --- |
* | "The header at the top of the ticket shows the title, current status, priority, assigned volunteer, and queue. **Encryption by field.** Title and description ..." |
*
* @param {Demo_Narrative_Topic_Case_Header_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_case_header_body: ((inputs?: Demo_Narrative_Topic_Case_Header_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Case_Header_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Case_Header_BodyInputs = {};
