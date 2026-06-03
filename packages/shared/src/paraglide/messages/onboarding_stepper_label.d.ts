/**
* | output |
* | --- |
* | "Setup progress" |
*
* @param {Onboarding_Stepper_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_stepper_label: ((inputs?: Onboarding_Stepper_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Stepper_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Stepper_LabelInputs = {};
