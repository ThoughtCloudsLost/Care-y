/**
* | output |
* | --- |
* | "{count} method(s) enrolled" |
*
* @param {Onboarding_Twofa_EnrolledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_enrolled: ((inputs: Onboarding_Twofa_EnrolledInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Twofa_EnrolledInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Twofa_EnrolledInputs = {
    count: NonNullable<unknown>;
};
