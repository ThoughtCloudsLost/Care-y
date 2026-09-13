/**
* | output |
* | --- |
* | "Your phone number has not been verified." |
*
* @param {Error_Consultant_Not_VerifiedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_consultant_not_verified: ((inputs?: Error_Consultant_Not_VerifiedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Consultant_Not_VerifiedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Consultant_Not_VerifiedInputs = {};
