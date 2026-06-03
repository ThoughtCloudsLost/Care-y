/**
* | output |
* | --- |
* | "At least 16 characters" |
*
* @param {Onboarding_Account_Password_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_password_placeholder: ((inputs?: Onboarding_Account_Password_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Account_Password_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Account_Password_PlaceholderInputs = {};
