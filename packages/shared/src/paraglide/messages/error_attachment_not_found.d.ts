/**
* | output |
* | --- |
* | "Attachment not found." |
*
* @param {Error_Attachment_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_attachment_not_found: ((inputs?: Error_Attachment_Not_FoundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Attachment_Not_FoundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Attachment_Not_FoundInputs = {};
