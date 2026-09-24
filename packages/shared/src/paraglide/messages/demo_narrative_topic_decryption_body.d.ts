/**
* | output |
* | --- |
* | "The browser opens a ticket's title with a key wrapped for the signed-in account, and the server holds the ciphertext and that wrap without being able to use ..." |
*
* @param {Demo_Narrative_Topic_Decryption_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_decryption_body: ((inputs?: Demo_Narrative_Topic_Decryption_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Decryption_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Decryption_BodyInputs = {};
