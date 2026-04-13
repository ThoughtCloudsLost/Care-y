/**
* | output |
* | --- |
* | "Could not copy to clipboard." |
*
* @param {Common_Copy_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const common_copy_failed: ((inputs?: Common_Copy_FailedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Common_Copy_FailedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Common_Copy_FailedInputs = {};
