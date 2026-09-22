/**
* | output |
* | --- |
* | "The channel policy decides which of five communication channels an organization uses, one switch each for SMS, email, secure links, voice and share links, an..." |
*
* @param {Demo_Narrative_Admin_Channel_Policy_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_channel_policy_body: ((inputs?: Demo_Narrative_Admin_Channel_Policy_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Channel_Policy_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Channel_Policy_BodyInputs = {};
