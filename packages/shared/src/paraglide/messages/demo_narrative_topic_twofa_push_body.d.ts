/**
* | output |
* | --- |
* | "When push notifications are enabled, a sign-in attempt sends an approval prompt to the device. Approving completes the sign-in. No code is involved. Each pro..." |
*
* @param {Demo_Narrative_Topic_Twofa_Push_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_push_body: ((inputs?: Demo_Narrative_Topic_Twofa_Push_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Twofa_Push_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Twofa_Push_BodyInputs = {};
