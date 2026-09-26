/**
* | output |
* | --- |
* | "An SMS template is the text of an automatic reply, written once per language an organization serves. Auto-reply is sent to every inbound text. Error response..." |
*
* @param {Demo_Narrative_Admin_Sms_Templates_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_sms_templates_body: ((inputs?: Demo_Narrative_Admin_Sms_Templates_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Sms_Templates_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Sms_Templates_BodyInputs = {};
