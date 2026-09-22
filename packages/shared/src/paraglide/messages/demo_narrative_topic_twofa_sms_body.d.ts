/**
* | output |
* | --- |
* | "A six-digit code is sent by text to the number enrolled on the account. It is good for five minutes and a third wrong entry deletes it, the same shape as an ..." |
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
