/**
* | output |
* | --- |
* | "Confirm Password" |
*
* @param {Onboarding_Account_Confirm_PasswordInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_confirm_password: ((inputs?: Onboarding_Account_Confirm_PasswordInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Account_Confirm_PasswordInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Account_Confirm_PasswordInputs = {};
