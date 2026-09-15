/**
* | output |
* | --- |
* | "When a client updates their contact information through the portal, the change appears in the ticket thread as a flagged entry with a tinted background and a..." |
*
* @param {Demo_Narrative_Topic_Correction_Status_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_correction_status_body: ((inputs?: Demo_Narrative_Topic_Correction_Status_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Correction_Status_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Correction_Status_BodyInputs = {};
