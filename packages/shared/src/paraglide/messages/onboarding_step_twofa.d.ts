/**
* | output |
* | --- |
* | "Security" |
*
* @param {Onboarding_Step_TwofaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_twofa: ((inputs?: Onboarding_Step_TwofaInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Step_TwofaInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Step_TwofaInputs = {};
