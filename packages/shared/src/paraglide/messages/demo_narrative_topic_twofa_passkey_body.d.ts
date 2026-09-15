/**
* | output |
* | --- |
* | "A passkey makes a device the second factor, so there is no code to type. CARE-Y accepts two forms of it, one held by the device being used and unlocked with ..." |
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
