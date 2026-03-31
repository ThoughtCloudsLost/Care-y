/**
* | output |
* | --- |
* | "No consultant registration found." |
*
* @param {Error_No_Consultant_RegistrationInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_no_consultant_registration: ((inputs?: Error_No_Consultant_RegistrationInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_No_Consultant_RegistrationInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_No_Consultant_RegistrationInputs = {};
