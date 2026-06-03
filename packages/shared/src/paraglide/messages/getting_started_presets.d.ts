/**
* | output |
* | --- |
* | "Add preset replies" |
*
* @param {Getting_Started_PresetsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_presets: ((inputs?: Getting_Started_PresetsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_PresetsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_PresetsInputs = {};
