/**
* | output |
* | --- |
* | "This file was already recovered." |
*
* @param {Error_Portal_Reseed_Already_ConvertedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_portal_reseed_already_converted: ((inputs?: Error_Portal_Reseed_Already_ConvertedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Portal_Reseed_Already_ConvertedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Portal_Reseed_Already_ConvertedInputs = {};
