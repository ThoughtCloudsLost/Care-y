/**
* | output |
* | --- |
* | "Did not upload" |
*
* @param {Attachment_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const attachment_failed: ((inputs?: Attachment_FailedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Attachment_FailedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Attachment_FailedInputs = {};
