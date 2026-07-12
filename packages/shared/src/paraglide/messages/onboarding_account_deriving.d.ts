/**
* | output |
* | --- |
* | "Creating your keys..." |
*
* @param {Onboarding_Account_DerivingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_deriving: ((inputs?: Onboarding_Account_DerivingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Account_DerivingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Account_DerivingInputs = {};
