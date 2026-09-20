/**
* | output |
* | --- |
* | "Enroll at least one method to continue." |
*
* @param {Onboarding_Twofa_At_Least_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_at_least_one: ((inputs?: Onboarding_Twofa_At_Least_OneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Twofa_At_Least_OneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Twofa_At_Least_OneInputs = {};
