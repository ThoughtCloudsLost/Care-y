/**
* | output |
* | --- |
* | "Attached image" |
*
* @param {Portal_Attachment_ImageInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_attachment_image: ((inputs?: Portal_Attachment_ImageInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Attachment_ImageInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Attachment_ImageInputs = {};
