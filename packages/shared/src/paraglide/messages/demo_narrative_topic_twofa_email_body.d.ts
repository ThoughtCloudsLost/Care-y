/**
* | output |
* | --- |
* | "A six digit code is sent to the email address on file for the account, and it expires five minutes after it is sent. **Attempts.** An email code survives thr..." |
*
* @param {Demo_Narrative_Topic_Twofa_Email_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_email_body: ((inputs?: Demo_Narrative_Topic_Twofa_Email_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Twofa_Email_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Twofa_Email_BodyInputs = {};
