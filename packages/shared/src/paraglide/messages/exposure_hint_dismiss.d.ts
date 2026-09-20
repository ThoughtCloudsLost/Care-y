/**
* | output |
* | --- |
* | "Got it" |
*
* @param {Exposure_Hint_DismissInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const exposure_hint_dismiss: ((inputs?: Exposure_Hint_DismissInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Exposure_Hint_DismissInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Exposure_Hint_DismissInputs = {};
