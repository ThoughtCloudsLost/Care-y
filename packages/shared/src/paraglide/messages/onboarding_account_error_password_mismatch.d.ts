/**
* | output |
* | --- |
* | "Passwords do not match." |
*
* @param {Onboarding_Account_Error_Password_MismatchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_error_password_mismatch: ((inputs?: Onboarding_Account_Error_Password_MismatchInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Account_Error_Password_MismatchInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Account_Error_Password_MismatchInputs = {};
