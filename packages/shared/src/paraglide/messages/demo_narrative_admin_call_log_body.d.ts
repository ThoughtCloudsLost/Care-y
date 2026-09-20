/**
* | output |
* | --- |
* | "No phone number appears anywhere in the call log. The client alias on each row is decrypted in the browser with the organization key and is the only encrypte..." |
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
