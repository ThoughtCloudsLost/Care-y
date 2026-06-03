/**
* | output |
* | --- |
* | "Creating account..." |
*
* @param {Onboarding_Account_CreatingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_creating: ((inputs?: Onboarding_Account_CreatingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Account_CreatingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Account_CreatingInputs = {};
