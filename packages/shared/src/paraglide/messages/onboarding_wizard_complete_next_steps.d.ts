/**
* | output |
* | --- |
* | "Recommended next steps" |
*
* @param {Onboarding_Wizard_Complete_Next_StepsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_wizard_complete_next_steps: ((inputs?: Onboarding_Wizard_Complete_Next_StepsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Wizard_Complete_Next_StepsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Wizard_Complete_Next_StepsInputs = {};
