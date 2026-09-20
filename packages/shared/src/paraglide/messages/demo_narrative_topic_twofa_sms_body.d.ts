/**
* | output |
* | --- |
* | "A six-digit code is sent by text message to the enrolled phone number. It expires after five minutes and is deleted after three incorrect attempts. **What th..." |
*
* @param {Demo_Narrative_Topic_Twofa_Sms_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_sms_body: ((inputs?: Demo_Narrative_Topic_Twofa_Sms_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Twofa_Sms_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Twofa_Sms_BodyInputs = {};
