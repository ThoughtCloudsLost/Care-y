/**
* | output |
* | --- |
* | "Minimum 16 characters. This password derives your encryption keys." |
*
* @param {Onboarding_Account_Password_InfoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_password_info: ((inputs?: Onboarding_Account_Password_InfoInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Account_Password_InfoInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Account_Password_InfoInputs = {};
