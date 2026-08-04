/**
* | output |
* | --- |
* | "Preference saved" |
*
* @param {Notif_Pref_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_pref_saved: ((inputs?: Notif_Pref_SavedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Pref_SavedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Pref_SavedInputs = {};
