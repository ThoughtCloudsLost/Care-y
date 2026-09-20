/**
* | output |
* | --- |
* | "Saved Replies" |
*
* @param {Admin_Tab_PresetsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_tab_presets: ((inputs?: Admin_Tab_PresetsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Tab_PresetsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Tab_PresetsInputs = {};
