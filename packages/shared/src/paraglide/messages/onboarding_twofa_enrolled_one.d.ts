/**
* | output |
* | --- |
* | "1 method enrolled" |
*
* @param {Onboarding_Twofa_Enrolled_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_enrolled_one: ((inputs?: Onboarding_Twofa_Enrolled_OneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Twofa_Enrolled_OneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Twofa_Enrolled_OneInputs = {};
