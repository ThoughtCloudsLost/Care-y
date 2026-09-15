/**
* | output |
* | --- |
* | "Emails sent and received on a ticket appear in the same conversation thread as SMS messages, portal replies, and internal notes. **Outbound emails.** When a ..." |
*
* @param {Demo_Narrative_Topic_Email_Thread_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_email_thread_body: ((inputs?: Demo_Narrative_Topic_Email_Thread_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Email_Thread_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Email_Thread_BodyInputs = {};
