/**
* | output |
* | --- |
* | "Add at least one verification method to protect your account. Even if your password is compromised, no one else can access the system without this second fac..." |
*
* @param {Onboarding_Twofa_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_desc: ((inputs?: Onboarding_Twofa_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Twofa_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Twofa_DescInputs = {};
