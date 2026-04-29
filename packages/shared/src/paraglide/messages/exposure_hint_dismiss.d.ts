/**
* | output |
* | --- |
* | "Got it" |
*
* @param {Exposure_Hint_DismissInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const exposure_hint_dismiss: ((inputs?: Exposure_Hint_DismissInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Exposure_Hint_DismissInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Exposure_Hint_DismissInputs = {};
