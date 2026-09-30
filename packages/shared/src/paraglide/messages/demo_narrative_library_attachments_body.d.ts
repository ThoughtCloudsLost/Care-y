/**
* | output |
* | --- |
* | "Articles accept file attachments that the browser encrypts with the organization key before upload. Accepted types are images (JPEG, PNG, GIF, WebP), PDFs an..." |
*
* @param {Demo_Narrative_Library_Attachments_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_attachments_body: ((inputs?: Demo_Narrative_Library_Attachments_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Library_Attachments_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Library_Attachments_BodyInputs = {};
