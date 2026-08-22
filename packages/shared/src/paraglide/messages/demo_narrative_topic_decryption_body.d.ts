/**
* | output |
* | --- |
* | "When the ticket list loads, titles appear as scrambled text that resolves into readable words as the browser decrypts each one. **How it works.** The browser..." |
*
* @param {Demo_Narrative_Topic_Decryption_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_decryption_body: ((inputs?: Demo_Narrative_Topic_Decryption_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Decryption_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Decryption_BodyInputs = {};
