/**
* | output |
* | --- |
* | "After your password, CARE-Y requires a second factor. Six methods are supported, and each one confirms your identity before the system proceeds to derive you..." |
*
* @param {Demo_Narrative_Topic_Twofa_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_body: ((inputs?: Demo_Narrative_Topic_Twofa_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Twofa_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Twofa_BodyInputs = {};
