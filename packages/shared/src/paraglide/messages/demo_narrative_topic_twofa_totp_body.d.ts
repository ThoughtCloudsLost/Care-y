/**
* | output |
* | --- |
* | "An authenticator app on your device generates a six digit code that changes every thirty seconds. The code is computed from a secret shared once at enrollmen..." |
*
* @param {Demo_Narrative_Topic_Twofa_Totp_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_totp_body: ((inputs?: Demo_Narrative_Topic_Twofa_Totp_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Twofa_Totp_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Twofa_Totp_BodyInputs = {};
