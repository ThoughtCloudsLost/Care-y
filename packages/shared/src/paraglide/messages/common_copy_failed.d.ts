/**
* | output |
* | --- |
* | "Could not copy to clipboard." |
*
* @param {Common_Copy_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const common_copy_failed: ((inputs?: Common_Copy_FailedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Common_Copy_FailedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Common_Copy_FailedInputs = {};
