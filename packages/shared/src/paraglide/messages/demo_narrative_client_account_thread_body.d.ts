/**
* | output |
* | --- |
* | "After signing in, the account page shows the same message thread and composer as the secure link portal, and the client can close the browser, return later, ..." |
*
* @param {Demo_Narrative_Client_Account_Thread_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_thread_body: ((inputs?: Demo_Narrative_Client_Account_Thread_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Account_Thread_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Account_Thread_BodyInputs = {};
