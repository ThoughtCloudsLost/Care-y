/**
* | output |
* | --- |
* | "Attachment uploaded" |
*
* @param {Library_Attachment_UploadedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_attachment_uploaded: ((inputs?: Library_Attachment_UploadedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Attachment_UploadedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Attachment_UploadedInputs = {};
