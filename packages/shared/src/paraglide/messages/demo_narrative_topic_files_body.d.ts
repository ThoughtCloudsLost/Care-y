/**
* | output |
* | --- |
* | "A file attached to a ticket is sealed in the browser before upload. Both the bytes and the filename reach the server as ciphertext. [[#encryption #client-dat..." |
*
* @param {Demo_Narrative_Topic_Files_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_files_body: ((inputs?: Demo_Narrative_Topic_Files_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Files_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Files_BodyInputs = {};
