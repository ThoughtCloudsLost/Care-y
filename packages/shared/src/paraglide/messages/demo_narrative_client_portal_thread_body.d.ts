/**
* | output |
* | --- |
* | "The portal thread gathers the client's own messages, the organization's replies, voicemails, call entries, files and contact corrections into one timeline or..." |
*
* @param {Demo_Narrative_Client_Portal_Thread_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_portal_thread_body: ((inputs?: Demo_Narrative_Client_Portal_Thread_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Portal_Thread_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Portal_Thread_BodyInputs = {};
