/**
* | output |
* | --- |
* | "File from text message" |
*
* @param {Attachment_Sms_UnnamedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const attachment_sms_unnamed: ((inputs?: Attachment_Sms_UnnamedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Attachment_Sms_UnnamedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Attachment_Sms_UnnamedInputs = {};
