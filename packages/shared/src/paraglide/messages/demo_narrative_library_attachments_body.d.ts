/**
* | output |
* | --- |
* | "Articles can have file attachments, both inline images and downloadable files. **Encryption.** All attachments are encrypted with the organization key before..." |
*
* @param {Demo_Narrative_Library_Attachments_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_attachments_body: ((inputs?: Demo_Narrative_Library_Attachments_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Library_Attachments_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Library_Attachments_BodyInputs = {};
