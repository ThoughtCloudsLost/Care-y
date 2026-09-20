/**
* | output |
* | --- |
* | "Uploading" |
*
* @param {Attachment_UploadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const attachment_uploading: ((inputs?: Attachment_UploadingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Attachment_UploadingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Attachment_UploadingInputs = {};
