/**
* | output |
* | --- |
* | "Your login username is a pseudonym, not linked to your real identity." |
*
* @param {Vol_Protected_IdentifierInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_protected_identifier: ((inputs?: Vol_Protected_IdentifierInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Vol_Protected_IdentifierInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Vol_Protected_IdentifierInputs = {};
