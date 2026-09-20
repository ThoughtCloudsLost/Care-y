/**
* | output |
* | --- |
* | "Preferences reset to defaults" |
*
* @param {Notif_Pref_Reset_SuccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_pref_reset_success: ((inputs?: Notif_Pref_Reset_SuccessInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Pref_Reset_SuccessInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Pref_Reset_SuccessInputs = {};
