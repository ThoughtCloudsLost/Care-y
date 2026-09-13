/**
* | output |
* | --- |
* | "Phone re-verification is required to enable this feature." |
*
* @param {Error_Reverification_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_reverification_required: ((inputs?: Error_Reverification_RequiredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Reverification_RequiredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Reverification_RequiredInputs = {};
