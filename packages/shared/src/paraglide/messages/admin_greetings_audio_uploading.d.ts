/**
* | output |
* | --- |
* | "Uploading..." |
*
* @param {Admin_Greetings_Audio_UploadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_audio_uploading: ((inputs?: Admin_Greetings_Audio_UploadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Greetings_Audio_UploadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Greetings_Audio_UploadingInputs = {};
