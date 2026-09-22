/**
* | output |
* | --- |
* | "An SMS template is the wording of an automatic reply, written once for each language an organization serves. Two templates exist, the reply to a first messag..." |
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
