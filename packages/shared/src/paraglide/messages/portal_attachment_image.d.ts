/**
* | output |
* | --- |
* | "Attached image" |
*
* @param {Portal_Attachment_ImageInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_attachment_image: ((inputs?: Portal_Attachment_ImageInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Attachment_ImageInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Attachment_ImageInputs = {};
