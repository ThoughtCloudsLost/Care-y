/**
* | output |
* | --- |
* | "Two-factor verification required." |
*
* @param {Error_Twofa_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_twofa_required: ((inputs?: Error_Twofa_RequiredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Twofa_RequiredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Twofa_RequiredInputs = {};
