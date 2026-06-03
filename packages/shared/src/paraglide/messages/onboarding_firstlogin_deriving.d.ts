/**
* | output |
* | --- |
* | "Generating encryption keys..." |
*
* @param {Onboarding_Firstlogin_DerivingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_deriving: ((inputs?: Onboarding_Firstlogin_DerivingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Firstlogin_DerivingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Firstlogin_DerivingInputs = {};
