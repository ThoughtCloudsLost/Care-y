/**
* | output |
* | --- |
* | "Could not load voicemail audio" |
*
* @param {Admin_Quarantine_Player_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_player_error: ((inputs?: Admin_Quarantine_Player_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Quarantine_Player_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Quarantine_Player_ErrorInputs = {};
