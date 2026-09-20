/**
* | output |
* | --- |
* | "Discard" |
*
* @param {Library_Discard_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_discard_confirm: ((inputs?: Library_Discard_ConfirmInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Discard_ConfirmInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Discard_ConfirmInputs = {};
