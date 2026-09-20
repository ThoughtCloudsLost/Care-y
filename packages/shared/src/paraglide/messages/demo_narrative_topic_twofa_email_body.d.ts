/**
* | output |
* | --- |
* | "A six-digit code is sent to the email address on file. It expires after five minutes and is deleted after three incorrect attempts. **What the server holds.*..." |
*
* @param {Demo_Narrative_Topic_Twofa_Email_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_email_body: ((inputs?: Demo_Narrative_Topic_Twofa_Email_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Twofa_Email_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Twofa_Email_BodyInputs = {};
