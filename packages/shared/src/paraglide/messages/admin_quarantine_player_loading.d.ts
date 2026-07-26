/**
* | output |
* | --- |
* | "Decrypting audio..." |
*
* @param {Admin_Quarantine_Player_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_player_loading: ((inputs?: Admin_Quarantine_Player_LoadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Quarantine_Player_LoadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Quarantine_Player_LoadingInputs = {};
