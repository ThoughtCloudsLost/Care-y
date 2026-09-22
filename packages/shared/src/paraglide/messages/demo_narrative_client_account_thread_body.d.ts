/**
* | output |
* | --- |
* | "An account returns the client to the same conversation on every visit, so closing the browser and coming back days later needs a password rather than a link ..." |
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
