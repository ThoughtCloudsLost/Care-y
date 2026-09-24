/**
* | output |
* | --- |
* | "This file was already recovered." |
*
* @param {Error_Portal_Reseed_Already_ConvertedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_portal_reseed_already_converted: ((inputs?: Error_Portal_Reseed_Already_ConvertedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Portal_Reseed_Already_ConvertedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Portal_Reseed_Already_ConvertedInputs = {};
