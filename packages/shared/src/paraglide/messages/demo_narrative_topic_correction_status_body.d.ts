/**
* | output |
* | --- |
* | "A contact correction appears in the unified case thread as its own follow-up type. It carries the phone number or email address a client reports as current. ..." |
*
* @param {Demo_Narrative_Topic_Correction_Status_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_correction_status_body: ((inputs?: Demo_Narrative_Topic_Correction_Status_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Correction_Status_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Correction_Status_BodyInputs = {};
