/**
* | output |
* | --- |
* | "An article can carry images placed inside its text and files hung off it for download, and both are encrypted in the browser before upload. Images, PDFs and ..." |
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
