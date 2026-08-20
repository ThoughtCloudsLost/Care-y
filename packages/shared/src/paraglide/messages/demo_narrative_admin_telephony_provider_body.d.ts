/**
* | output |
* | --- |
* | "The telephony section starts with how the organization connects to its phone provider. **Two modes.** In managed mode the numbers are provisioned for the org..." |
*
* @param {Demo_Narrative_Admin_Telephony_Provider_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_telephony_provider_body: ((inputs?: Demo_Narrative_Admin_Telephony_Provider_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Telephony_Provider_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Telephony_Provider_BodyInputs = {};
