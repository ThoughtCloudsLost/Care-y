/**
* | output |
* | --- |
* | "Step {current} of {total}" |
*
* @param {Onboarding_Stepper_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_stepper_progress: ((inputs: Onboarding_Stepper_ProgressInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Stepper_ProgressInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Stepper_ProgressInputs = {
    current: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
