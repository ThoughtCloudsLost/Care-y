/**
* | output |
* | --- |
* | "Attachment upload failed" |
*
* @param {Library_Attachment_Upload_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_attachment_upload_failed: ((inputs?: Library_Attachment_Upload_FailedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Attachment_Upload_FailedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Attachment_Upload_FailedInputs = {};
