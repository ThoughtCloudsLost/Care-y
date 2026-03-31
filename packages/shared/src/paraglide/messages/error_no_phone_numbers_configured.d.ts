/**
* | output |
* | --- |
* | "No phone numbers configured for this organization." |
*
* @param {Error_No_Phone_Numbers_ConfiguredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_no_phone_numbers_configured: ((inputs?: Error_No_Phone_Numbers_ConfiguredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_No_Phone_Numbers_ConfiguredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_No_Phone_Numbers_ConfiguredInputs = {};
