/**
* | output |
* | --- |
* | "1 method enrolled" |
*
* @param {Onboarding_Twofa_Enrolled_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_enrolled_one: ((inputs?: Onboarding_Twofa_Enrolled_OneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Twofa_Enrolled_OneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Twofa_Enrolled_OneInputs = {};
