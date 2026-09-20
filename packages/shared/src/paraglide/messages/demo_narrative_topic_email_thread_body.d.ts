/**
* | output |
* | --- |
* | "Emails sent and received on a ticket appear in the same conversation thread as SMS messages, portal replies, and internal notes. **Outbound emails.** When a ..." |
*
* @param {Demo_Narrative_Topic_Email_Thread_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_email_thread_body: ((inputs?: Demo_Narrative_Topic_Email_Thread_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Email_Thread_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Email_Thread_BodyInputs = {};
