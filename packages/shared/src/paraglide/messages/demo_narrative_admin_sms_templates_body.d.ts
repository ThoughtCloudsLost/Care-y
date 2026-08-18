/**
* | output |
* | --- |
* | "SMS templates define the automated messages the system sends to clients. Templates support multiple languages so the system can send messages in the client's..." |
*
* @param {Demo_Narrative_Admin_Sms_Templates_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_sms_templates_body: ((inputs?: Demo_Narrative_Admin_Sms_Templates_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Sms_Templates_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Sms_Templates_BodyInputs = {};
