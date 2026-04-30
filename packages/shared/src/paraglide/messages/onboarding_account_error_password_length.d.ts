/**
* | output |
* | --- |
* | "Password must be at least 12 characters." |
*
* @param {Onboarding_Account_Error_Password_LengthInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_error_password_length: ((inputs?: Onboarding_Account_Error_Password_LengthInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Account_Error_Password_LengthInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Account_Error_Password_LengthInputs = {};
