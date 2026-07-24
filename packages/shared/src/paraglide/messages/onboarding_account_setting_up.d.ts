/**
* | output |
* | --- |
* | "Setting up your protection..." |
*
* @param {Onboarding_Account_Setting_UpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_setting_up: ((inputs?: Onboarding_Account_Setting_UpInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Account_Setting_UpInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Account_Setting_UpInputs = {};
