/**
* | output |
* | --- |
* | "A passkey asks your device to sign a one time challenge with a private key that never leaves it. Your fingerprint or face unlocks the signature locally. Ther..." |
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
