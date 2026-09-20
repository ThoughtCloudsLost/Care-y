/**
* | output |
* | --- |
* | "Saved Replies" |
*
* @param {Panel_PresetsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_presets: ((inputs?: Panel_PresetsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_PresetsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_PresetsInputs = {};
