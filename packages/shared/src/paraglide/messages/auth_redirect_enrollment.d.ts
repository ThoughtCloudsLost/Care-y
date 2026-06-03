/**
* | output |
* | --- |
* | "Redirecting to account setup..." |
*
* @param {Auth_Redirect_EnrollmentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_redirect_enrollment: ((inputs?: Auth_Redirect_EnrollmentInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Auth_Redirect_EnrollmentInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Auth_Redirect_EnrollmentInputs = {};
