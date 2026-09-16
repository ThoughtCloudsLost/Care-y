/**
* | output |
* | --- |
* | "No phone number appears anywhere in the call log. The client alias on each row is decrypted in the browser with the organization key and is the only encrypte..." |
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
