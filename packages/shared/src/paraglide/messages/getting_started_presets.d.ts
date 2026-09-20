/**
* | output |
* | --- |
* | "Add preset replies" |
*
* @param {Getting_Started_PresetsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_presets: ((inputs?: Getting_Started_PresetsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_PresetsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_PresetsInputs = {};
