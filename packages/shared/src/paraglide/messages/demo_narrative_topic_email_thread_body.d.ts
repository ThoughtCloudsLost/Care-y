/**
* | output |
* | --- |
* | "Email sent and received on a case sits in the same thread as texts, portal replies and notes, and is the one channel whose content is readable by every mail ..." |
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
