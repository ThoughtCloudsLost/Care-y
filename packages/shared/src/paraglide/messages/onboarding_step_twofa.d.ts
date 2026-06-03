/**
* | output |
* | --- |
* | "Security" |
*
* @param {Onboarding_Step_TwofaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_twofa: ((inputs?: Onboarding_Step_TwofaInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Step_TwofaInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Step_TwofaInputs = {};
