/**
* | output |
* | --- |
* | "The file did not upload. Remove it and try again." |
*
* @param {Attachment_Upload_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const attachment_upload_failed: ((inputs?: Attachment_Upload_FailedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Attachment_Upload_FailedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Attachment_Upload_FailedInputs = {};
