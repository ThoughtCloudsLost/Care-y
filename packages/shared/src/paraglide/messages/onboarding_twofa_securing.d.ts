/**
* | output |
* | --- |
* | "Securing session..." |
*
* @param {Onboarding_Twofa_SecuringInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_securing: ((inputs?: Onboarding_Twofa_SecuringInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Twofa_SecuringInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Twofa_SecuringInputs = {};
