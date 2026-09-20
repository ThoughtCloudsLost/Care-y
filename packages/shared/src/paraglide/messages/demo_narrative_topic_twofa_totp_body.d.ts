/**
* | output |
* | --- |
* | "An authenticator app generates a six-digit code that changes every 30 seconds. The code is computed from a shared secret and the current time, so it works wi..." |
*
* @param {Demo_Narrative_Topic_Twofa_Totp_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_totp_body: ((inputs?: Demo_Narrative_Topic_Twofa_Totp_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Twofa_Totp_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Twofa_Totp_BodyInputs = {};
