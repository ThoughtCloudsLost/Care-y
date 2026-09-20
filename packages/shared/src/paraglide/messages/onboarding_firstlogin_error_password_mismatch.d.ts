/**
* | output |
* | --- |
* | "Passwords do not match." |
*
* @param {Onboarding_Firstlogin_Error_Password_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_error_password_mismatch: ((inputs?: Onboarding_Firstlogin_Error_Password_MismatchInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Firstlogin_Error_Password_MismatchInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Firstlogin_Error_Password_MismatchInputs = {};
