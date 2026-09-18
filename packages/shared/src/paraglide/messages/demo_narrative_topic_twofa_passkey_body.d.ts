/**
* | output |
* | --- |
* | "A passkey turns the device into the second factor. No code to type, nothing to intercept. Two forms are supported: a device credential protected by the scree..." |
*
* @param {Demo_Narrative_Topic_Twofa_Passkey_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_passkey_body: ((inputs?: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Twofa_Passkey_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Twofa_Passkey_BodyInputs = {};
