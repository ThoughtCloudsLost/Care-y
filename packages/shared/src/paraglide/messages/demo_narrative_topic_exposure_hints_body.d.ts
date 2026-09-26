/**
* | output |
* | --- |
* | "Sending a text or placing a call leaves the encrypted path. The browser warns once per channel per session that the phone provider can read or hear the conte..." |
*
* @param {Demo_Narrative_Topic_Exposure_Hints_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_exposure_hints_body: ((inputs?: Demo_Narrative_Topic_Exposure_Hints_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Exposure_Hints_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Exposure_Hints_BodyInputs = {};
