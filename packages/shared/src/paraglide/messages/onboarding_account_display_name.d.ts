/**
* | output |
* | --- |
* | "Display Name" |
*
* @param {Onboarding_Account_Display_NameInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_display_name: ((inputs?: Onboarding_Account_Display_NameInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Account_Display_NameInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Account_Display_NameInputs = {};
