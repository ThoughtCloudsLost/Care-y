/**
* | output |
* | --- |
* | "Continue" |
*
* @param {Onboarding_Twofa_ContinueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_continue: ((inputs?: Onboarding_Twofa_ContinueInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Twofa_ContinueInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Twofa_ContinueInputs = {};
