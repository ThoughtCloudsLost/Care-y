/**
* | output |
* | --- |
* | "Attachments" |
*
* @param {Library_AttachmentsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_attachments: ((inputs?: Library_AttachmentsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_AttachmentsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_AttachmentsInputs = {};
