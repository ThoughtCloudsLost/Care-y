/**
* | output |
* | --- |
* | "The portal thread is a merged timeline of messages, voicemails, call entries, attachments, and contact corrections, sorted by date. The view can be narrowed ..." |
*
* @param {Demo_Narrative_Client_Portal_Thread_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_portal_thread_body: ((inputs?: Demo_Narrative_Client_Portal_Thread_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Portal_Thread_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Portal_Thread_BodyInputs = {};
