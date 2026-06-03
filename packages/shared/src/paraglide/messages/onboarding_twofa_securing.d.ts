/**
* | output |
* | --- |
* | "Securing session..." |
*
* @param {Onboarding_Twofa_SecuringInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_securing: ((inputs?: Onboarding_Twofa_SecuringInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Twofa_SecuringInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Twofa_SecuringInputs = {};
