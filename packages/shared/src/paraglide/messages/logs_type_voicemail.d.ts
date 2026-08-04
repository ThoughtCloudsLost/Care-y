/**
* | output |
* | --- |
* | "Voicemail" |
*
* @param {Logs_Type_VoicemailInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_type_voicemail: ((inputs?: Logs_Type_VoicemailInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Type_VoicemailInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Type_VoicemailInputs = {};
