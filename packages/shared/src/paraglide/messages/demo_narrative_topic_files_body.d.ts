/**
* | output |
* | --- |
* | "Volunteers can attach files to a ticket, and each file is encrypted with the per ticket key before upload so the server stores only ciphertext along with the..." |
*
* @param {Demo_Narrative_Topic_Files_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_files_body: ((inputs?: Demo_Narrative_Topic_Files_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Files_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Files_BodyInputs = {};
