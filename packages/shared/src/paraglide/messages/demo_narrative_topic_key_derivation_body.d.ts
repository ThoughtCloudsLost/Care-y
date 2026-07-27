/**
* | output |
* | --- |
* | "This is the core of the security model. After Argon2id stretching and two-factor verification, CARE-Y performs a threshold Oblivious Pseudorandom Function (O..." |
*
* @param {Demo_Narrative_Topic_Key_Derivation_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_key_derivation_body: ((inputs?: Demo_Narrative_Topic_Key_Derivation_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Key_Derivation_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Key_Derivation_BodyInputs = {};
