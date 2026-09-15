/**
* | output |
* | --- |
* | "The privacy notice is a localized page covering the full set of standard GDPR disclosure items, and it is accessible before and after a submission. **Telepho..." |
*
* @param {Demo_Narrative_Client_Privacy_Notice_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_privacy_notice_body: ((inputs?: Demo_Narrative_Client_Privacy_Notice_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Privacy_Notice_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Privacy_Notice_BodyInputs = {};
