/**
* | output |
* | --- |
* | "Go to Dashboard" |
*
* @param {Onboarding_Wizard_Complete_GoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_wizard_complete_go: ((inputs?: Onboarding_Wizard_Complete_GoInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Wizard_Complete_GoInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Wizard_Complete_GoInputs = {};
