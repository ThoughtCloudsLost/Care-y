/**
* | output |
* | --- |
* | "Ticket titles are stored as ciphertext on the server. The browser fetches and decrypts each title locally using the volunteer's encryption keys. **Performanc..." |
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
