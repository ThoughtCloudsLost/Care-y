/**
* | output |
* | --- |
* | "Audio greeting uploaded." |
*
* @param {Admin_Greetings_Audio_UploadedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_audio_uploaded: ((inputs?: Admin_Greetings_Audio_UploadedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Audio_UploadedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Audio_UploadedInputs = {};
