/**
* | output |
* | --- |
* | "Tap to continue" |
*
* @param {Demo_Tap_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_tap_hint: ((inputs?: Demo_Tap_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Tap_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Tap_HintInputs = {};
