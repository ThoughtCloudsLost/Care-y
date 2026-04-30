/**
* | output |
* | --- |
* | "Step {current} of {total}" |
*
* @param {Onboarding_Stepper_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_stepper_progress: ((inputs: Onboarding_Stepper_ProgressInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Stepper_ProgressInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Stepper_ProgressInputs = {
    current: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
