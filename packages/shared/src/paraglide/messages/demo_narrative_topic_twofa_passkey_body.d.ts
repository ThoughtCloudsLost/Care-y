/**
* | output |
* | --- |
* | "A passkey turns the device itself into the second factor. No one-time code leaves the device, and no secret crosses the network. [[#keys #privacy]] **Platfor..." |
*
* @param {Demo_Narrative_Topic_Twofa_Passkey_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_passkey_body: ((inputs?: Demo_Narrative_Topic_Twofa_Passkey_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Twofa_Passkey_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Twofa_Passkey_BodyInputs = {};
