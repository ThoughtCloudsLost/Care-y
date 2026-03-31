/**
* | output |
* | --- |
* | "Authenticator app is not set up." |
*
* @param {Error_Totp_Not_EnrolledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_totp_not_enrolled: ((inputs?: Error_Totp_Not_EnrolledInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Totp_Not_EnrolledInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Totp_Not_EnrolledInputs = {};
