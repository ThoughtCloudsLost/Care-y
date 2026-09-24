/**
* | output |
* | --- |
* | "File from text message" |
*
* @param {Attachment_Sms_UnnamedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const attachment_sms_unnamed: ((inputs?: Attachment_Sms_UnnamedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Attachment_Sms_UnnamedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Attachment_Sms_UnnamedInputs = {};
