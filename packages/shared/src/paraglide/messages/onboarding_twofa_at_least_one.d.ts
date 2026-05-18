/**
* | output |
* | --- |
* | "Enroll at least one method to continue." |
*
* @param {Onboarding_Twofa_At_Least_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_at_least_one: ((inputs?: Onboarding_Twofa_At_Least_OneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Twofa_At_Least_OneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Twofa_At_Least_OneInputs = {};
