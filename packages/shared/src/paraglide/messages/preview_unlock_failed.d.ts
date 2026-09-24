/**
* | output |
* | --- |
* | "Could not unlock this preview" |
*
* @param {Preview_Unlock_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const preview_unlock_failed: ((inputs?: Preview_Unlock_FailedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Preview_Unlock_FailedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Preview_Unlock_FailedInputs = {};
