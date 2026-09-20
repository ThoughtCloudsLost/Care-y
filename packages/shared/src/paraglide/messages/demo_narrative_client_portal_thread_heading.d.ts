/**
* | output |
* | --- |
* | "Message thread" |
*
* @param {Demo_Narrative_Client_Portal_Thread_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_portal_thread_heading: ((inputs?: Demo_Narrative_Client_Portal_Thread_HeadingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Portal_Thread_HeadingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Portal_Thread_HeadingInputs = {};
