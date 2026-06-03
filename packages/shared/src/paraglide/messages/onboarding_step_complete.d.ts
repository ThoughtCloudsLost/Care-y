/**
* | output |
* | --- |
* | "Step complete." |
*
* @param {Onboarding_Step_CompleteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_complete: ((inputs?: Onboarding_Step_CompleteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Step_CompleteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Step_CompleteInputs = {};
