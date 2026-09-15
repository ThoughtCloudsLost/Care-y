/**
* | output |
* | --- |
* | "The calls tab shows a chronological list of phone calls and voicemail entries across the organization. Each row shows the call direction, the client alias de..." |
*
* @param {Demo_Narrative_Admin_Call_Log_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_call_log_body: ((inputs?: Demo_Narrative_Admin_Call_Log_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Call_Log_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Call_Log_BodyInputs = {};
