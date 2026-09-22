/**
* | output |
* | --- |
* | "The provider connection is how an organization reaches a phone network, under one of two arrangements. Bring your own telephony means the organization keeps ..." |
*
* @param {Demo_Narrative_Admin_Telephony_Provider_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_telephony_provider_body: ((inputs?: Demo_Narrative_Admin_Telephony_Provider_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Telephony_Provider_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Telephony_Provider_BodyInputs = {};
