/**
* | output |
* | --- |
* | "The call history lists every call and voicemail recorded against a ticket, newest first, fifty at a time, and carries no phone number at any point. Each row ..." |
*
* @param {Demo_Narrative_Admin_Call_Log_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_call_log_body: ((inputs?: Demo_Narrative_Admin_Call_Log_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Call_Log_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Call_Log_BodyInputs = {};
