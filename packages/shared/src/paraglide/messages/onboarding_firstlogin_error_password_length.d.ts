/**
* | output |
* | --- |
* | "Password must be at least 16 characters." |
*
* @param {Onboarding_Firstlogin_Error_Password_LengthInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_error_password_length: ((inputs?: Onboarding_Firstlogin_Error_Password_LengthInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Firstlogin_Error_Password_LengthInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Firstlogin_Error_Password_LengthInputs = {};
