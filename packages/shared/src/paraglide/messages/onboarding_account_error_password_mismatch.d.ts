/**
* | output |
* | --- |
* | "Passwords do not match." |
*
* @param {Onboarding_Account_Error_Password_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_error_password_mismatch: ((inputs?: Onboarding_Account_Error_Password_MismatchInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Account_Error_Password_MismatchInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Account_Error_Password_MismatchInputs = {};
