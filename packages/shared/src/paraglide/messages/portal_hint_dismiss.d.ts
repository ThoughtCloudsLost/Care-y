/**
* | output |
* | --- |
* | "Got it" |
*
* @param {Portal_Hint_DismissInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_hint_dismiss: ((inputs?: Portal_Hint_DismissInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Hint_DismissInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Hint_DismissInputs = {};
