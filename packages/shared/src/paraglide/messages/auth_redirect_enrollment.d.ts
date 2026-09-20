/**
* | output |
* | --- |
* | "Redirecting to account setup..." |
*
* @param {Auth_Redirect_EnrollmentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_redirect_enrollment: ((inputs?: Auth_Redirect_EnrollmentInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Auth_Redirect_EnrollmentInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Auth_Redirect_EnrollmentInputs = {};
