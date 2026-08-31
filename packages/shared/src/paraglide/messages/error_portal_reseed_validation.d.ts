/**
* | output |
* | --- |
* | "Some messages could not be recovered." |
*
* @param {Error_Portal_Reseed_ValidationInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_portal_reseed_validation: ((inputs?: Error_Portal_Reseed_ValidationInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Portal_Reseed_ValidationInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Portal_Reseed_ValidationInputs = {};
