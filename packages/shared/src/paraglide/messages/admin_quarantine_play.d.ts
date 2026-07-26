/**
* | output |
* | --- |
* | "Play voicemail" |
*
* @param {Admin_Quarantine_PlayInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_play: ((inputs?: Admin_Quarantine_PlayInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Quarantine_PlayInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Quarantine_PlayInputs = {};
