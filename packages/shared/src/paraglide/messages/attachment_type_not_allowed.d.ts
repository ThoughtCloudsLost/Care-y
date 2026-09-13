/**
* | output |
* | --- |
* | "That kind of file cannot be sent here." |
*
* @param {Attachment_Type_Not_AllowedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const attachment_type_not_allowed: ((inputs?: Attachment_Type_Not_AllowedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Attachment_Type_Not_AllowedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Attachment_Type_Not_AllowedInputs = {};
